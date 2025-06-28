import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Badge,
  Select,
  Option,
  Card,
  CardHeader,
  CardBody,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Tooltip,
  Switch,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  EyeIcon,
  CheckIcon,
  ClockIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";

export function ManageBooking() {
  const [bookings, setBookings] = useState([]);
  const [deals, setDeals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [formData, setFormData] = useState({
    dealId: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    airport: "",
    selectedDate: "",
    returnDate: "",
    adults: 1,
    children: 0,
    selectedPrice: null,
    selectedHotel: null
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [bookingName, setBookingName] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [statusBooking, setStatusBooking] = useState(null);
  const [statusValue, setStatusValue] = useState("pending");
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [emailData, setEmailData] = useState({
    name: "",
    email: "",
    destination: "",
    bookingRef: "",
    pax: 1,
    departureDate: "",
    nights: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [statusInProgress, setStatusInProgress] = useState(false);
  const [emailInProgress, setEmailInProgress] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isEmailManualMode, setIsEmailManualMode] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchDeals();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await axios.get("/bookings");
      setBookings(response.data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      setAlert({ message: "Error fetching bookings", type: "red" });
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await axios.get("/bookings/deals");
      console.log("Deals data:", response.data);
      
      setDeals(response.data);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setAlert({ message: "Error fetching deals", type: "red" });
    }
  };

  const handleOpenDialog = (booking = null) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    // Reset manual mode when opening dialog
    setIsManualMode(false);
    
    if (booking) {
      // booking.dealId might be populated as an object { _id, title, ... }
      const bookingDealId =
        typeof booking.dealId === "object"
          ? booking.dealId._id
          : booking.dealId;

      // find the selected deal from your fetched list
      const selected = deals.find((d) => d.id === bookingDealId);

      // match the exact price block
      const bookingDate = booking.selectedDate ? 
        (typeof booking.selectedDate === 'string' ? 
          booking.selectedDate.split("T")[0] : 
          new Date(booking.selectedDate).toISOString().split("T")[0]) : 
        "";
        
      const matchedPrice = selected?.prices?.find(
        (p) =>
          p.airport === booking.airport &&
          p.startdate.split("T")[0] === bookingDate,
      );

      setSelectedDeal(selected);
      setSelectedPrice(matchedPrice);

      // Create a properly structured selectedPrice object that works in both auto and manual modes
      const priceData = booking.selectedPrice || {};
      
      // Ensure flight details are properly structured
      const flightDetails = priceData.flightDetails || {
        outbound: {
          airline: "Manual Entry",
          flightNumber: "N/A",
          departureTime: "00:00",
          arrivalTime: "00:00"
        },
        returnFlight: {
          airline: "Manual Entry",
          flightNumber: "N/A",
          departureTime: "00:00",
          arrivalTime: "00:00"
        }
      };
      
      const structuredPrice = {
        ...priceData,
        price: priceData.price || 0,
        hotel: priceData.hotel || (typeof booking.selectedHotel === 'object' ? booking.selectedHotel.name : booking.selectedHotel || ''),
        flightDetails
      };

      // Format dates to ensure they're in ISO format (YYYY-MM-DD)
      let returnDateFormatted = "";
      if (booking.returnDate) {
        if (typeof booking.returnDate === 'string') {
          returnDateFormatted = booking.returnDate.split("T")[0];
        } else {
          returnDateFormatted = new Date(booking.returnDate).toISOString().split("T")[0];
        }
      }

      // now set your formData with the string ID, not the full object
      setFormData({
        dealId: bookingDealId,
        name: booking.name || "",
        email: booking.email || "",
        phone: booking.phone || "",
        message: booking.message || "",
        airport: booking.airport || "",
        selectedDate: bookingDate,
        returnDate: returnDateFormatted,
        adults: booking.adults || 1,
        children: booking.children || 0,
        selectedPrice: structuredPrice,
        selectedHotel: booking.selectedHotel || null
      });
    } else {
      // reset
      setSelectedDeal(null);
      setSelectedPrice(null);
      setFormData({
        dealId: "",
        name: "",
        email: "",
        phone: "",
        message: "",
        airport: "",
        selectedDate: "",
        returnDate: "",
        adults: 1,
        children: 0,
        selectedPrice: null,
        selectedHotel: null
      });
    }
    setCurrentBooking(booking);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBooking(null);
    setAlert({ message: "", type: "" });
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      // Ensure required fields have values
      if (!formData.dealId) {
        throw new Error("Please select a deal");
      }
      
      if (!formData.airport) {
        throw new Error("Airport is required");
      }
      
      if (!formData.selectedDate) {
        throw new Error("Departure date is required");
      }
      
      // Validate return date is present in automatic mode
      if (!isManualMode && !formData.returnDate) {
        throw new Error("Return date is required in automatic mode");
      }
      
      // Format dates properly
      let selectedDate = formData.selectedDate;
      let returnDate = formData.returnDate;
      
      // Ensure dates are in ISO format (YYYY-MM-DD)
      if (selectedDate && typeof selectedDate === 'string') {
        if (!selectedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Try to convert to ISO format if it's not already
          const dateObj = new Date(selectedDate);
          if (!isNaN(dateObj.getTime())) {
            selectedDate = dateObj.toISOString().split('T')[0];
          }
        }
      }
      
      if (returnDate && typeof returnDate === 'string') {
        if (!returnDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Try to convert to ISO format if it's not already
          const dateObj = new Date(returnDate);
          if (!isNaN(dateObj.getTime())) {
            returnDate = dateObj.toISOString().split('T')[0];
          }
        }
      }
      
      // Process the hotel field (could be an ID or an object)
      let selectedHotel = null;
      let hotelName = null;
      
      // If we have a hotel in formData.selectedPrice, extract it
      if (formData.selectedPrice?.hotel) {
        if (typeof formData.selectedPrice.hotel === 'object' && formData.selectedPrice.hotel._id) {
          // If it's an object with _id, use the _id as selectedHotel
          selectedHotel = formData.selectedPrice.hotel._id;
        } else if (typeof formData.selectedPrice.hotel === 'string') {
          // If it's just a string, store it as hotelName
          hotelName = formData.selectedPrice.hotel;
        }
      }
      
      // If we have a separate selectedHotel value, check that too
      if (!selectedHotel && formData.selectedHotel) {
        if (typeof formData.selectedHotel === 'object' && formData.selectedHotel._id) {
          selectedHotel = formData.selectedHotel._id;
        } else if (typeof formData.selectedHotel === 'string') {
          hotelName = formData.selectedHotel;
        }
      }
      
      // Ensure flight details are properly structured
      let flightDetails = null;
      if (isManualMode && formData.selectedPrice) {
        // In manual mode, ensure we have a valid structure
        flightDetails = {
          outbound: {
            airline: formData.selectedPrice?.flightDetails?.outbound?.airline || "Manual Entry",
            flightNumber: formData.selectedPrice?.flightDetails?.outbound?.flightNumber || "N/A",
            departureTime: formData.selectedPrice?.flightDetails?.outbound?.departureTime || "00:00",
            arrivalTime: formData.selectedPrice?.flightDetails?.outbound?.arrivalTime || "00:00"
          },
          returnFlight: {
            airline: formData.selectedPrice?.flightDetails?.returnFlight?.airline || "Manual Entry",
            flightNumber: formData.selectedPrice?.flightDetails?.returnFlight?.flightNumber || "N/A",
            departureTime: formData.selectedPrice?.flightDetails?.returnFlight?.departureTime || "00:00",
            arrivalTime: formData.selectedPrice?.flightDetails?.returnFlight?.arrivalTime || "00:00"
          }
        };
      } else if (formData.selectedPrice?.flightDetails) {
        // In auto mode, use the existing structure
        flightDetails = formData.selectedPrice.flightDetails;
      }
      
      // Ensure airport is a string before submitting
      const submissionData = {
        ...formData,
        airport: String(formData.airport || "").toUpperCase(),
        selectedDate,
        returnDate,
        selectedHotel, // Only use selectedHotel if it's a valid ObjectId
        isManualEntry: isManualMode, // Add flag to indicate manual entry
        // Make sure we have a valid price object with at least the price field
        selectedPrice: formData.selectedPrice ? {
          ...formData.selectedPrice,
          price: Number(formData.selectedPrice.price) || 0,
          hotel: hotelName, // Include hotel name in selectedPrice if we have it
          flightDetails: flightDetails // Use our properly structured flight details
        } : null
      };
      
      console.log("Submitting booking data:", submissionData);
      
      if (currentBooking) {
        console.log("Updating booking:", currentBooking._id);
        const response = await axios.put(`/bookings/update/${currentBooking._id}`, submissionData);
        console.log("Update response:", response.data);
        setAlert({ message: `Booking for ${formData.name} updated successfully!`, type: "green" });
        
        // After 3 seconds, clear the alert
        setTimeout(() => {
          setAlert({ message: "", type: "" });
        }, 3000);
      } else {
        console.log("Creating new booking");
        const response = await axios.post("/bookings/createbyadmin", submissionData);
        console.log("Create response:", response.data);
        setAlert({ message: `New booking for ${formData.name} created successfully!`, type: "green" });
        
        // After 3 seconds, clear the alert
        setTimeout(() => {
          setAlert({ message: "", type: "" });
        }, 3000);
      }
      fetchBookings();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving booking:", error);
      
      // Extract and display specific error message from the response if available
      let errorMessage = "Error saving booking";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setAlert({ message: errorMessage, type: "red" });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id, name) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setDeleteId(id);
    setBookingName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      await axios.delete(`/bookings/${id}`);
      setAlert({ message: `Booking for ${bookingName} deleted successfully!`, type: "green" });
      
      // After 3 seconds, clear the alert
      setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 3000);
      
      fetchBookings();
    } catch (error) {
      console.error("Error deleting booking:", error);
      setAlert({ message: "Error deleting booking", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
      setDeleteInProgress(false);
    }
  };

  const handleOpenStatusDialog = (booking) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setStatusBooking(booking);
    setStatusValue(booking.status || "pending");
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setStatusBooking(null);
    setStatusInProgress(false);
  };

  const handleStatusSubmit = async () => {
    if (statusInProgress) return;
    
    try {
      setStatusInProgress(true);
      await axios.put(`/bookings/${statusBooking._id}/status`, {
        status: statusValue,
      });
      
      // Show success message with booking name and new status
      setAlert({ 
        message: `Status for ${statusBooking.name}'s booking updated to "${statusValue}"!`, 
        type: "green" 
      });
      
      // After 3 seconds, clear the alert
      setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 3000);
      
      fetchBookings(); // re-fetch your list
      setOpenStatusDialog(false);
    } catch (error) {
      console.error("Error updating status:", error);
      // Show error alert
      setAlert({ 
        message: `Failed to update booking status: ${error.message || "Unknown error"}`, 
        type: "red" 
      });
    } finally {
      setStatusInProgress(false);
    }
  };

  const handleOpenViewDialog = (booking) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setCurrentBooking(booking);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setCurrentBooking(null);
  };

  const handleOpenEmailDialog = (booking) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    // Reset email manual mode when opening dialog
    setIsEmailManualMode(false);
    
    const formattedDeparture = booking.selectedDate
      ? booking.selectedDate.split("T")[0]
      : "";
    setCurrentBooking(booking);
    console.log(booking);
    const selectedDeal = deals.find((d) => d.id === booking.dealId);

    setEmailData({
      name: booking.name,
      email: booking.email,
      destination: booking.dealId.title,
      bookingRef: booking._id,
      pax: booking.adults,
      departureDate: formattedDeparture,
      nights: booking.nights || 0,
      days: booking.days || 0,
    });
    setSelectedDeal(selectedDeal);
    setOpenEmailDialog(true);
  };

  const handleCloseEmailDialog = () => {
    setOpenEmailDialog(false);
    setAlert({ message: "", type: "" });
    setEmailInProgress(false);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (emailInProgress) return;
    
    try {
      setEmailInProgress(true);
      
      // Validate required fields based on mode
      if (!isEmailManualMode && !emailData.returnDate) {
        throw new Error("Return date is required in automatic mode");
      }
      
      await axios.post("/mail/send-booking-info", emailData);
      
      // Set success message including recipient details
      setAlert({ 
        message: `Booking confirmation sent successfully to ${emailData.name} (${emailData.email})`, 
        type: "green" 
      });
      
      // Close dialog
      handleCloseEmailDialog();
      
      // After 3 seconds, clear the alert
      setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 3000);
      
    } catch (error) {
      console.error("Error sending email:", error);
      setAlert({ 
        message: error.message || "Failed to send confirmation email.", 
        type: "red" 
      });
    } finally {
      setEmailInProgress(false);
    }
  };

  return (
    <div className="h-screen w-full overflow-hidden px-4 py-6">
      {alert.message && (
        <Alert
          color={alert.type}
          onClose={() => setAlert({ message: "", type: "" })}
          className="mb-4"
        >
          {alert.message}
        </Alert>
      )}

      <div className="mb-4 flex justify-end">
        <Button onClick={() => handleOpenDialog()} color="blue" disabled={buttonDisabled}>
          Create New Booking
        </Button>
      </div>

      {/* Main Card */}
      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {bookings.length === 0 ? (
            <Typography>No bookings found.</Typography>
          ) : (
            bookings.map((booking) => (
              <Card
                key={booking._id}
                className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Left half: booking info */}
                  <div className="flex-1 space-y-1">
                    {/* Name */}
                    <Typography
                      variant="h5"
                      color="deep-orange"
                      className="font-semibold"
                    >
                      {booking.name}
                    </Typography>

                    {/* Phone */}
                    <Typography className="flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-blue-500" />
                      <a
                        href={`tel:${booking.phone}`}
                        className="font-bold text-blue-700 underline transition-colors duration-300 ease-in-out hover:text-deep-orange-500"
                      >
                        {booking.phone}
                      </a>
                    </Typography>

                    {/* Email */}
                    <Typography className="flex items-center gap-2">
                      <EnvelopeIcon className="h-5 w-5 text-blue-500 " />
                      <a
                        href={`mailto:${booking.email}`}
                        className="font-bold text-blue-700 underline transition-colors duration-300 ease-in-out hover:text-deep-orange-500"
                      >
                        {booking.email}
                      </a>
                    </Typography>

                    {/* Deal title */}
                    <Typography color="green" className="mt-1 font-medium">
                      Deal: {booking.dealId.title}
                    </Typography>

                    {/* Adults */}
                    <Typography color="black">
                      Adults: {booking.adults}
                    </Typography>

                    {/* Price per person */}
                    <Typography color="black">
                      Price:{" "}
                      {booking.selectedPrice?.price
                        ? `$${booking.selectedPrice.price}`
                        : "N/A"}
                      / per person
                    </Typography>

                    {/* Total price = price per person × adults */}
                    <Typography color="black" className="font-semibold">
                      Total:{" "}
                      {booking.selectedPrice?.price
                        ? `$${booking.selectedPrice.price * booking.adults}`
                        : "N/A"}
                    </Typography>

                    {/* Hotel */}
                    <Typography color="black">
                      Hotel:{" "}
                      {typeof booking.selectedHotel === 'object' && booking.selectedHotel?.name
                        ? booking.selectedHotel.name
                        : booking.selectedPrice?.hotel || "N/A"}
                    </Typography>

                    {/* Created date */}
                    <Typography
                      color="blue"
                      className="flex items-center gap-1 font-semibold"
                    >
                      <CalendarDaysIcon className="h-5 w-5" />
                      Request Date:{" "}
                      {new Date(booking.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </Typography>
                  </div>

                  {/* Right half: status + actions */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Status badge */}
                    <div className="flex items-center gap-2">
                      {booking.status === "pending" && (
                        <Badge
                          content={
                            <ClockIcon
                              className="h-4 w-4 text-white"
                              strokeWidth={2.5}
                            />
                          }
                          className="border-2 border-white bg-gradient-to-tr from-amber-400 to-amber-600 shadow-lg shadow-black/20"
                        >
                          <Button
                            onClick={() => handleOpenStatusDialog(booking)}
                            color="blue"
                            className="capitalize"
                            disabled={buttonDisabled}
                          >
                            {booking.status}
                          </Button>
                        </Badge>
                      )}
                      {booking.status === "confirmed" && (
                        <Badge
                          content={
                            <CheckIcon
                              className="h-4 w-4 text-white"
                              strokeWidth={2.5}
                            />
                          }
                          className="border-2 border-white bg-gradient-to-tr from-green-400 to-green-600 shadow-lg shadow-black/20"
                        >
                          <Button
                            onClick={() => handleOpenStatusDialog(booking)}
                            color="blue"
                            className="capitalize"
                            disabled={buttonDisabled}
                          >
                            {booking.status}
                          </Button>
                        </Badge>
                      )}
                      {booking.status === "cancelled" && (
                        <Badge
                          content={
                            <XMarkIcon
                              className="h-4 w-4 text-white"
                              strokeWidth={2.5}
                            />
                          }
                          className="border-2 border-white bg-gradient-to-tr from-red-400 to-red-600 shadow-lg shadow-black/20"
                        >
                          <Button
                            onClick={() => handleOpenStatusDialog(booking)}
                            color="blue"
                            className="capitalize"
                            disabled={buttonDisabled}
                          >
                            {booking.status}
                          </Button>
                        </Badge>
                      )}
                    </div>

                    {/* Status dialog opener */}
                    <Tooltip
                      content="View"
                      placement="left"
                      className="font-medium text-blue-600"
                      animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0, y: 25 },
                      }}
                    >
                      <Button
                        variant="text"
                        color="blue"
                        onClick={() => handleOpenViewDialog(booking)}
                        className="p-2"
                        disabled={buttonDisabled}
                      >
                        <EyeIcon strokeWidth={2} className="h-5 w-5" />
                      </Button>
                    </Tooltip>

                    {/* Edit */}
                    <Tooltip
                      content="Edit"
                      placement="left"
                      className="font-medium text-green-600"
                      animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0, y: 25 },
                      }}
                    >
                      <Button
                        variant="text"
                        color="green"
                        onClick={() => handleOpenDialog(booking)}
                        className="p-2"
                        disabled={buttonDisabled}
                      >
                        <PencilSquareIcon className="h-5 w-5" />
                      </Button>
                    </Tooltip>

                    {/* Delete */}
                    <Tooltip
                      content="Delete"
                      placement="left"
                      className="font-medium text-red-500"
                      color="red"
                      animate={{
                        mount: { scale: 1, y: 0 },
                        unmount: { scale: 0, y: 25 },
                      }}
                    >
                      <Button
                        variant="text"
                        color="red"
                        onClick={() => confirmDelete(booking._id, booking.name)}
                        className="p-2"
                        disabled={buttonDisabled}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                    {/* Actions */}
                    <div className="flex flex-col items-end gap-4">
                      <Button
                        onClick={() => handleOpenEmailDialog(booking)}
                        color="blue"
                        disabled={buttonDisabled}
                      >
                        Send Confirmation Email
                      </Button>
                      {/* Other action buttons (view, edit, delete) */}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* View Dilog */}
      <Dialog open={openViewDialog} handler={handleCloseViewDialog} size="lg">
        <DialogHeader className="flex items-start justify-between bg-white p-4">
          <Typography
            variant="h5"
            className="flex items-center gap-2 text-deep-orange-400"
          >
            Booking Details
          </Typography>
          <div className="flex items-center justify-center gap-2">
            <Tooltip
              content="Edit"
              placement="left"
              className="z-[50000] font-medium text-green-600"
            >
              <Button variant="text" color="green" className="p-2">
                <PencilSquareIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="Delete"
              placement="top"
              className="z-[50000] font-medium text-red-500"
            >
              <Button variant="text" color="red" className="p-2">
                <TrashIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="Close"
              placement="right"
              className="z-[50000] font-medium text-purple-500"
            >
              <Button
                variant="text"
                color="purple"
                onClick={handleCloseViewDialog}
                className="p-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </div>
        </DialogHeader>

        <DialogBody className="h-[480px] overflow-y-auto bg-gray-50 p-4 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
          {currentBooking ? (
            <div className="mt-8 space-y-12">
              {/* Basic Details Card */}
              <Card className="border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Booking Information
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Name:
                    </span>{" "}
                    {currentBooking.name}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Email:
                    </span>{" "}
                    {currentBooking.email}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Phone:
                    </span>{" "}
                    {currentBooking.phone}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Message:
                    </span>{" "}
                    {currentBooking.message || "N/A"}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Airport:
                    </span>{" "}
                    {currentBooking.airport}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Selected Date:
                    </span>{" "}
                    {new Date(currentBooking.selectedDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Return Date:
                    </span>{" "}
                    {new Date(currentBooking.returnDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Adults:
                    </span>{" "}
                    {currentBooking.adults}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Children:
                    </span>{" "}
                    {currentBooking.children}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Status:
                    </span>{" "}
                    {currentBooking.status}
                  </Typography>
                </CardBody>
              </Card>
              {/* Flight Details Card */}
              <Card className="border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Flight Details
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Outbound Flight:
                    </span>
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Airline:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.outbound
                        .airline
                    }
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Flight Number:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.outbound
                        .flightNumber
                    }
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Departure Time:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.outbound
                        .departureTime
                    }
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Arrival Time:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.outbound
                        .arrivalTime
                    }
                  </Typography>

                  <Typography variant="paragraph" className="mt-4 text-black">
                    <span className="font-bold text-deep-orange-500">
                      Return Flight:
                    </span>
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Airline:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.returnFlight
                        .airline
                    }
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Flight Number:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.returnFlight
                        .flightNumber
                    }
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Departure Time:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.returnFlight
                        .departureTime
                    }
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Arrival Time:
                    </span>{" "}
                    {
                      currentBooking.selectedPrice.flightDetails.returnFlight
                        .arrivalTime
                    }
                  </Typography>
                </CardBody>
              </Card>

              {/* Price Details Card */}
              <Card className="border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Price Details
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Price:
                    </span>{" "}
                    ${currentBooking.selectedPrice.price}
                  </Typography>
                </CardBody>
              </Card>

              {/* Selected Hotel Card */}
              <Card className="border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Selected Hotel
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Hotel Name:
                    </span>{" "}
                    {typeof currentBooking.selectedHotel === 'object' && currentBooking.selectedHotel?.name
                      ? currentBooking.selectedHotel.name
                      : currentBooking.selectedPrice?.hotel || "N/A"}
                  </Typography>
                </CardBody>
              </Card>
            </div>
          ) : (
            <Typography variant="h6" className="text-black">
              No booking details available.
            </Typography>
          )}
        </DialogBody>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={openEmailDialog} handler={handleCloseEmailDialog} size="md">
        <DialogHeader>Send Booking Confirmation</DialogHeader>
        <DialogBody className="h-[480px] space-y-4 overflow-y-auto bg-gray-50 p-4 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
          {alert.message && (
            <Alert
              color={alert.type}
              onClose={() => setAlert({ message: "", type: "" })}
            >
              {alert.message}
            </Alert>
          )}
          
          <div className="mb-4 flex items-center justify-end gap-2">
            <Typography variant="small" color="blue-gray">Automatic</Typography>
            <Switch 
              color="blue"
              checked={isEmailManualMode} 
              onChange={() => {
                setIsEmailManualMode(!isEmailManualMode);
              }}
              label="Manual"
              labelProps={{
                className: "text-blue-gray-500 font-medium"
              }}
            />
          </div>
          
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            {!isEmailManualMode ? (
              <>
                {/* Deal - Automatic mode */}
                <Select
                  label="Select Deal"
                  value={emailData.dealId || ""}
                  onChange={(dealId) => {
                    const deal = deals.find((d) => d.id === dealId);
                    setSelectedDeal(deal);
                    setSelectedPrice(null);
                    setEmailData((prev) => ({
                      ...prev,
                      dealId,
                      destination: deal?.title || "", // Set destination to the title of the selected deal
                      selectedDate: "",
                      returnDate: "",
                    }));
                  }}
                >
                  {deals.map((deal) => (
                    <Option key={deal.id} value={deal.id}>
                      {deal.title}
                    </Option>
                  ))}
                </Select>

                {/* Dates (only for setting dates) - Automatic mode */}
                {selectedDeal && (
                  <Select
                    label="Select Departure & Return Dates"
                    value={selectedPrice?.startdate || ""}
                    onChange={(date) => {
                      const price = selectedDeal.prices.find(
                        (p) => new Date(p.startdate).toISOString() === date,
                      );
                      setSelectedPrice(price);
                      
                      // Extract airport code based on the actual structure
                      let airportCode = "";
                      
                      if (price && price.airport) {
                        if (typeof price.airport === 'object') {
                          if (Array.isArray(price.airport)) {
                            // If it's an array, use the first airport code
                            const firstAirport = price.airport[0];
                            if (typeof firstAirport === 'object') {
                              airportCode = firstAirport.code || "";
                            } else {
                              airportCode = String(firstAirport);
                            }
                          } else if (price.airport._id) {
                            // If it's a direct object reference
                            airportCode = price.airport.code || "";
                          }
                        } else if (typeof price.airport === 'string') {
                          // If it's just a string code
                          airportCode = String(price.airport);
                        }
                      }
                      
                      setFormData({
                        ...formData,
                        airport: airportCode,
                        selectedDate: price ? price.startdate.split("T")[0] : "",
                        returnDate: price ? price.enddate.split("T")[0] : "",
                        selectedPrice: price,
                      });
                    }}
                  >
                    {selectedDeal.prices.map((price, index) => {
                      // Extract airport display name
                      let airportDisplay = "Unknown";
                      
                      if (price.airport) {
                        if (typeof price.airport === 'object') {
                          if (Array.isArray(price.airport)) {
                            // Join airport codes/names if it's an array
                            airportDisplay = price.airport.map(a => 
                              a.name || a.code || (typeof a === 'string' ? a : 'Unknown')
                            ).join(', ');
                          } 
                          // It could be a direct object reference
                          else if (price.airport._id) {
                            airportDisplay = price.airport.name || price.airport.code || "Unknown";
                          }
                        } 
                        // It could be a simple string (airport code)
                        else if (typeof price.airport === 'string') {
                          airportDisplay = price.airport;
                        }
                      }
                      
                      return (
                        <Option
                          key={index}
                          value={new Date(price.startdate).toISOString()}
                        >
                          {airportDisplay} –{" "}
                          {new Date(price.startdate).toLocaleDateString()} →{" "}
                          {new Date(price.enddate).toLocaleDateString()} ($
                          {price.price})
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </>
            ) : (
              <>
                {/* Manual mode inputs */}
                <Input
                  label="Destination"
                  value={emailData.destination}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  required
                />
              </>
            )}

            {/* Always visible fields */}
            <Input 
              label="Name" 
              value={emailData.name} 
              onChange={(e) => 
                setEmailData(prev => ({...prev, name: e.target.value}))
              }
              required
              className={isEmailManualMode ? "" : "opacity-70"}
              disabled={!isEmailManualMode}
            />
            <Input
              label="Email"
              type="email"
              value={emailData.email}
              onChange={(e) => 
                setEmailData(prev => ({...prev, email: e.target.value}))
              }
              required
              className={isEmailManualMode ? "" : "opacity-70"}
              disabled={!isEmailManualMode}
            />
            <Input
              label="Booking Reference"
              value={emailData.bookingRef}
              onChange={(e) => 
                setEmailData(prev => ({...prev, bookingRef: e.target.value}))
              }
              className={isEmailManualMode ? "" : "opacity-70"}
              disabled={!isEmailManualMode}
            />
            
            {/* Destination w/ clear button - this is now only visible in automatic mode */}
            {!isEmailManualMode && (
              <div className="relative">
                <Input
                  label="Destination"
                  value={emailData.destination}
                  onChange={(e) =>
                    setEmailData((prev) => ({
                      ...prev,
                      destination: e.target.value,
                    }))
                  }
                  required
                />
                {emailData.destination && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform"
                    onClick={() =>
                      setEmailData((prev) => ({ ...prev, destination: "" }))
                    }
                  >
                    <XMarkIcon className="h-4 w-4 text-blue-400 hover:text-blue-600" />
                  </button>
                )}
              </div>
            )}

            {/* Pax + Dates editable */}
            <Input
              label="Number of Travellers"
              type="number"
              value={emailData.pax}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, pax: e.target.value }))
              }
              required
            />
            <Input
              label="Departure Date"
              type="date"
              value={emailData.departureDate}
              onChange={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  departureDate: e.target.value,
                }))
              }
              required
            />
            <Input
              label="Return Date"
              type="date"
              value={emailData.returnDate}
              onChange={(e) =>
                setEmailData((prev) => ({
                  ...prev,
                  returnDate: e.target.value,
                }))
              }
              required={!isEmailManualMode}
            />
            <Input
              label="Nights"
              type="number"
              value={emailData.nights}
              onChange={(e) =>
                setEmailData({ ...emailData, nights: e.target.value })
              }
            />
            <Input
              label="Days"
              type="number"
              value={emailData.days}
              onChange={(e) =>
                setEmailData({ ...emailData, days: e.target.value })
              }
            />

            <Button type="submit" color="green" disabled={emailInProgress}>
              {emailInProgress ? "Sending..." : "Send Email"}
            </Button>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCloseEmailDialog} color="red" disabled={emailInProgress}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      {/* ——— Status Update Dialog ——— */}
      <Dialog
        open={openStatusDialog}
        handler={handleCloseStatusDialog}
        size="sm"
      >
        <DialogHeader>Update Booking Status</DialogHeader>
        <DialogBody className="space-y-4">
          <Select
            label="Status"
            value={statusValue}
            onChange={(value) => setStatusValue(value)}
          >
            <Option value="pending">Pending</Option>
            <Option value="confirmed">Confirmed</Option>
            <Option value="cancelled">Cancelled</Option>
          </Select>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={handleCloseStatusDialog}
            className="mr-1"
            disabled={statusInProgress}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleStatusSubmit} 
            color="green"
            disabled={statusInProgress}
          >
            {statusInProgress ? "Updating..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Add/Edit Booking Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader className="flex items-center justify-between">
          {currentBooking ? "Edit Booking" : "Create Booking"}
          {alert.message && (
            <Alert
              color={alert.type}
              onClose={() => setAlert({ message: "", type: "" })}
              className="mb-4 max-w-xl md:max-w-4xl"
            >
              {alert.message}
            </Alert>
          )}
        </DialogHeader>
        <DialogBody className="h-[480px] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
          <div className="mb-4 flex items-center justify-end gap-2">
            <Typography variant="small" color="blue-gray">Automatic</Typography>
            <Switch 
              color="blue"
              checked={isManualMode} 
              onChange={() => {
                // When switching to manual mode from automatic, preserve selected price data
                if (!isManualMode) {
                  // For new bookings with no selected price, initialize an empty structure
                  if (!formData.selectedPrice) {
                    setFormData({
                      ...formData,
                      selectedPrice: {
                        price: 0,
                        flightDetails: {
                          outbound: {
                            airline: "Manual Entry",
                            flightNumber: "N/A",
                            departureTime: "00:00",
                            arrivalTime: "00:00"
                          },
                          returnFlight: {
                            airline: "Manual Entry",
                            flightNumber: "N/A",
                            departureTime: "00:00",
                            arrivalTime: "00:00"
                          }
                        }
                      }
                    });
                  }
                }
                // When switching to automatic mode, try to match existing data to an option
                else if (isManualMode && formData.dealId && formData.selectedDate) {
                  const selected = deals.find(deal => deal.id === formData.dealId);
                  setSelectedDeal(selected);
                  
                  if (selected) {
                    // Try to find a matching price in the selected deal
                    const matchedPrice = selected.prices.find(
                      p => p.airport === formData.airport && 
                           p.startdate.split("T")[0] === formData.selectedDate
                    );
                    if (matchedPrice) {
                      setSelectedPrice(matchedPrice);
                    }
                  }
                }
                
                setIsManualMode(!isManualMode);
              }}
              label="Manual"
              labelProps={{
                className: "text-blue-gray-500 font-medium"
              }}
            />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Deal Title */}
            {!isManualMode ? (
              <>
                <Select
                  label="Select Deal"
                  value={formData.dealId}
                  onChange={(dealId) => {
                    const selected = deals.find((deal) => deal.id === dealId);
                    setFormData({
                      ...formData,
                      dealId,
                      airport: "",
                      selectedDate: "",
                      returnDate: "",
                    });
                    setSelectedDeal(selected);
                    setSelectedPrice(null);
                  }}
                >
                  {deals.map((deal) => (
                    <Option key={deal.id} value={deal.id}>
                      {deal.title}
                    </Option>
                  ))}
                </Select>

                {/* Show price options based on selected deal */}
                {selectedDeal && (
                  <Select
                    label="Select Airport & Dates"
                    value={selectedPrice?.startdate}
                    onChange={(date) => {
                      const price = selectedDeal.prices.find(
                        (p) => new Date(p.startdate).toISOString() === date,
                      );
                      setSelectedPrice(price);
                      
                      // Extract airport code based on the actual structure
                      let airportCode = "";
                      
                      if (price && price.airport) {
                        if (typeof price.airport === 'object') {
                          if (Array.isArray(price.airport)) {
                            // If it's an array, use the first airport code
                            const firstAirport = price.airport[0];
                            if (typeof firstAirport === 'object') {
                              airportCode = firstAirport.code || "";
                            } else {
                              airportCode = String(firstAirport);
                            }
                          } else if (price.airport._id) {
                            // If it's a direct object reference
                            airportCode = price.airport.code || "";
                          }
                        } else if (typeof price.airport === 'string') {
                          // If it's just a string code
                          airportCode = String(price.airport);
                        }
                      }
                      
                      setFormData({
                        ...formData,
                        airport: airportCode,
                        selectedDate: price ? price.startdate.split("T")[0] : "",
                        returnDate: price ? price.enddate.split("T")[0] : "",
                        selectedPrice: price,
                      });
                    }}
                  >
                    {selectedDeal.prices.map((price, index) => {
                      // Extract airport display name
                      let airportDisplay = "Unknown";
                      
                      if (price.airport) {
                        if (typeof price.airport === 'object') {
                          if (Array.isArray(price.airport)) {
                            // Join airport codes/names if it's an array
                            airportDisplay = price.airport.map(a => 
                              a.name || a.code || (typeof a === 'string' ? a : 'Unknown')
                            ).join(', ');
                          } 
                          // It could be a direct object reference
                          else if (price.airport._id) {
                            airportDisplay = price.airport.name || price.airport.code || "Unknown";
                          }
                        } 
                        // It could be a simple string (airport code)
                        else if (typeof price.airport === 'string') {
                          airportDisplay = price.airport;
                        }
                      }
                      
                      return (
                        <Option
                          key={index}
                          value={new Date(price.startdate).toISOString()}
                        >
                          {airportDisplay} –{" "}
                          {new Date(price.startdate).toLocaleDateString()} →{" "}
                          {new Date(price.enddate).toLocaleDateString()} ($
                          {price.price})
                        </Option>
                      );
                    })}
                  </Select>
                )}

                {/* Display hotel & price - read-only */}
                {selectedPrice && (
                  <>
                    <Input label="Hotel" value={selectedPrice.hotel} readOnly />
                    <Input
                      label="Price"
                      value={`$${selectedPrice.price}`}
                      readOnly
                    />
                    <Input
                      label="Airport Code"
                      value={formData.airport}
                      readOnly
                    />
                  </>
                )}
              </>
            ) : (
              <>
                {/* Manual mode notice */}
                <Alert color="blue" className="mb-4">
                  <div className="font-medium">Manual Entry Mode</div>
                  <div className="text-xs">You can enter booking details directly without validation against available deals</div>
                </Alert>
                
                <Select
                  label="Select Deal"
                  value={formData.dealId}
                  onChange={(dealId) => {
                    setFormData({
                      ...formData,
                      dealId,
                    });
                  }}
                >
                  {deals.map((deal) => (
                    <Option key={deal.id} value={deal.id}>
                      {deal.title}
                    </Option>
                  ))}
                </Select>
                <Input
                  label="Airport Code"
                  value={formData.airport || ""}
                  onChange={(e) =>
                    setFormData({ 
                      ...formData, 
                      airport: String(e.target.value).trim().toUpperCase() 
                    })
                  }
                  placeholder="Enter airport code (e.g. LHR)"
                  className="uppercase"
                  required
                />
                <Input
                  label="Selected Date"
                  type="date"
                  value={formData.selectedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, selectedDate: e.target.value })
                  }
                  required
                />
                <Input
                  label="Return Date"
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                  }
                  required={!isManualMode}
                />
                <Input
                  label="Price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.selectedPrice?.price || ""}
                  onChange={(e) => {
                    const price = e.target.value;
                    setFormData({
                      ...formData,
                      selectedPrice: { 
                        ...formData.selectedPrice, 
                        price 
                      },
                    });
                  }}
                />
                <Input
                  label="Hotel"
                  placeholder="Enter hotel name"
                  value={formData.selectedPrice?.hotel || ""}
                  onChange={(e) => {
                    const hotel = e.target.value;
                    setFormData({
                      ...formData,
                      selectedPrice: { 
                        ...formData.selectedPrice, 
                        hotel 
                      },
                    });
                  }}
                />
                
                {/* Flight details in manual mode */}
                {currentBooking && (
                  <>
                    <Typography variant="h6" color="blue" className="mt-4">
                      Flight Details (Manual Mode)
                    </Typography>
                    
                    {/* Outbound flight details */}
                    <Typography variant="small" color="deep-orange" className="font-medium">
                      Outbound Flight
                    </Typography>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Airline"
                        placeholder="Airline name"
                        value={formData.selectedPrice?.flightDetails?.outbound?.airline || ""}
                        onChange={(e) => {
                          const airline = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                outbound: {
                                  ...formData.selectedPrice?.flightDetails?.outbound,
                                  airline
                                }
                              }
                            }
                          });
                        }}
                      />
                      <Input
                        label="Flight Number"
                        placeholder="Flight number"
                        value={formData.selectedPrice?.flightDetails?.outbound?.flightNumber || ""}
                        onChange={(e) => {
                          const flightNumber = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                outbound: {
                                  ...formData.selectedPrice?.flightDetails?.outbound,
                                  flightNumber
                                }
                              }
                            }
                          });
                        }}
                      />
                      <Input
                        label="Departure Time"
                        placeholder="Departure time"
                        value={formData.selectedPrice?.flightDetails?.outbound?.departureTime || ""}
                        onChange={(e) => {
                          const departureTime = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                outbound: {
                                  ...formData.selectedPrice?.flightDetails?.outbound,
                                  departureTime
                                }
                              }
                            }
                          });
                        }}
                      />
                      <Input
                        label="Arrival Time"
                        placeholder="Arrival time"
                        value={formData.selectedPrice?.flightDetails?.outbound?.arrivalTime || ""}
                        onChange={(e) => {
                          const arrivalTime = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                outbound: {
                                  ...formData.selectedPrice?.flightDetails?.outbound,
                                  arrivalTime
                                }
                              }
                            }
                          });
                        }}
                      />
                    </div>

                    {/* Return flight details */}
                    <Typography variant="small" color="deep-orange" className="font-medium mt-2">
                      Return Flight
                    </Typography>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label="Airline"
                        placeholder="Airline name"
                        value={formData.selectedPrice?.flightDetails?.returnFlight?.airline || ""}
                        onChange={(e) => {
                          const airline = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                returnFlight: {
                                  ...formData.selectedPrice?.flightDetails?.returnFlight,
                                  airline
                                }
                              }
                            }
                          });
                        }}
                      />
                      <Input
                        label="Flight Number"
                        placeholder="Flight number"
                        value={formData.selectedPrice?.flightDetails?.returnFlight?.flightNumber || ""}
                        onChange={(e) => {
                          const flightNumber = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                returnFlight: {
                                  ...formData.selectedPrice?.flightDetails?.returnFlight,
                                  flightNumber
                                }
                              }
                            }
                          });
                        }}
                      />
                      <Input
                        label="Departure Time"
                        placeholder="Departure time"
                        value={formData.selectedPrice?.flightDetails?.returnFlight?.departureTime || ""}
                        onChange={(e) => {
                          const departureTime = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                returnFlight: {
                                  ...formData.selectedPrice?.flightDetails?.returnFlight,
                                  departureTime
                                }
                              }
                            }
                          });
                        }}
                      />
                      <Input
                        label="Arrival Time"
                        placeholder="Arrival time"
                        value={formData.selectedPrice?.flightDetails?.returnFlight?.arrivalTime || ""}
                        onChange={(e) => {
                          const arrivalTime = e.target.value;
                          setFormData({
                            ...formData,
                            selectedPrice: {
                              ...formData.selectedPrice,
                              flightDetails: {
                                ...formData.selectedPrice?.flightDetails,
                                returnFlight: {
                                  ...formData.selectedPrice?.flightDetails?.returnFlight,
                                  arrivalTime
                                }
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Remaining form inputs - always visible regardless of mode */}
            <Input
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
            <Input
              label="Message"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
            <Input
              label="Adults"
              type="number"
              value={formData.adults}
              onChange={(e) =>
                setFormData({ ...formData, adults: e.target.value })
              }
              required
            />
            <Input
              label="Children"
              type="number"
              value={formData.children}
              onChange={(e) =>
                setFormData({ ...formData, children: e.target.value })
              }
            />
            <Button type="submit" color="blue" disabled={loading || isSubmitting}>
              {loading
                ? "Loading..."
                : currentBooking
                ? "Update Booking"
                : "Create Booking"}
            </Button>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCloseDialog} color="red" disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        handler={() => setOpenDeleteDialog(false)}
      >
        <DialogHeader>Confirm Deletion</DialogHeader>
        <DialogBody>
          <Typography>
            Are you sure you want to delete the booking for {bookingName}?
          </Typography>
        </DialogBody>
        <DialogFooter className="flex justify-end items-center space-x-2">
          <Button onClick={() => setOpenDeleteDialog(false)} color="red" disabled={deleteInProgress}>
            Cancel
          </Button>
          <Button onClick={() => handleDelete(deleteId)} color="green" disabled={deleteInProgress}>
            {deleteInProgress ? "Deleting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default ManageBooking;
