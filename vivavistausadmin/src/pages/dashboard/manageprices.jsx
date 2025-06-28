import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Button,
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
  Select,
  Switch,
  Option,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Checkbox,
  Chip,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { MapPinIcon } from "@heroicons/react/24/solid";
import axios from "@/utils/axiosInstance";

export const ManagePrices = () => {
  const [deals, setDeals] = useState([]);
  const [currentDeal, setCurrentDeal] = useState(null);
  const dealIdRef = useRef(null); // Use ref instead of state for persistent dealId
  const [dealPrices, setDealPrices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [mainAlert, setMainAlert] = useState({ message: "", type: "" });
  const [dialogAlert, setDialogAlert] = useState({ message: "", type: "" });
  const [formAlert, setFormAlert] = useState({ message: "", type: "" });
  const [formData, setFormData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog states
  const [openPricesDialog, setOpenPricesDialog] = useState(false);
  const [openPriceFormDialog, setOpenPriceFormDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);

  // Form data
  const [hotels, setHotels] = useState([]);
  const [airports, setAirports] = useState([]);
  const countries = ["Canada", "USA", "UK"];

  useEffect(() => {
    fetchDeals();
    fetchFormData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        fetchDeals(searchQuery);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      fetchDeals();
    }
  }, [searchQuery]);

  const fetchDeals = async (search = "") => {
    try {
      setLoading(true);
      const response = await axios.get(`/prices/deals${search ? `?search=${search}` : ""}`);
      setDeals(response.data);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setMainAlert({ message: "Error fetching deals", type: "red" });
    } finally {
      setLoading(false);
    }
  };

  const fetchDealPrices = async (dealId) => {
    try {
      setLoading(true);
      setDialogAlert({ message: "", type: "" });
      console.log("Fetching prices for dealId:", dealId);
      
      const response = await axios.get(`/prices/deals/${dealId}`);
      console.log("Deal prices response:", response.data);
      
      if (response.data && response.data.dealId) {
        setCurrentDeal(response.data);
        setDealPrices(response.data.prices);
        console.log("Current deal set:", response.data);
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error fetching deal prices:", error);
      setDialogAlert({ message: "Error fetching deal prices", type: "red" });
      setOpenPricesDialog(false);
      setCurrentDeal(null);
      setDealPrices([]);
      dealIdRef.current = null; // Reset ref on error
    } finally {
      setLoading(false);
    }
  };

  const fetchFormData = async () => {
    try {
      const response = await axios.get("/prices/form-data");
      setHotels(response.data.hotels);
      setAirports(response.data.airports);
    } catch (error) {
      console.error("Error fetching form data:", error);
      setMainAlert({ message: "Error fetching form data", type: "red" });
    }
  };

  const handleOpenPricesDialog = async (deal) => {
    console.log("Opening prices dialog for deal:", deal);
    
    // Set dealId in ref and localStorage as backup
    dealIdRef.current = deal._id;
    localStorage.setItem('managePrices_dealId', deal._id);
    console.log("DealId ref and localStorage set to:", dealIdRef.current);
    
    setOpenPricesDialog(true);
    setCurrentDeal(null);
    setDealPrices([]);
    setDialogAlert({ message: "", type: "" });
    
    try {
      await fetchDealPrices(deal._id);
      console.log("Successfully loaded deal data");
    } catch (error) {
      console.error("Failed to open prices dialog:", error);
      setDialogAlert({ message: "Failed to load deal prices", type: "red" });
      setOpenPricesDialog(false);
      dealIdRef.current = null;
      localStorage.removeItem('managePrices_dealId');
    }
  };

  const handleClosePricesDialog = () => {
    setOpenPricesDialog(false);
    setCurrentDeal(null);
    setDealPrices([]);
    setDialogAlert({ message: "", type: "" });
    
    // Only reset dealId ref if no form dialogs are open
    if (!openPriceFormDialog && !openDeleteDialog) {
      dealIdRef.current = null;
      localStorage.removeItem('managePrices_dealId');
      console.log("Prices dialog closed, dealId ref and localStorage reset");
    } else {
      console.log("Prices dialog closed but form dialogs still open, keeping dealId ref");
    }
  };

  const handleOpenPriceFormDialog = (price = null) => {
    console.log("Opening price form dialog. DealId ref:", dealIdRef.current);
    
    if (!dealIdRef.current) {
      console.error("DealId ref not available:", dealIdRef.current);
      setDialogAlert({ message: "Deal information not available. Please close and reopen the dialog.", type: "red" });
      return;
    }

    setCurrentPrice(price);
    setFormAlert({ message: "", type: "" });
    
    if (price) {
      console.log("Edit mode - setting form data for price:", price);
      setFormData({
        country: price.country,
        startdate: price.startdate ? price.startdate.split("T")[0] : "",
        enddate: price.enddate ? price.enddate.split("T")[0] : "",
        price: price.price,
        airport: Array.isArray(price.airport) 
          ? price.airport.map(a => typeof a === "object" ? a._id : a)
          : [],
        hotel: typeof price.hotel === "object" ? price.hotel._id : price.hotel,
        priceswitch: price.priceswitch || false,
        flightDetails: price.flightDetails || {
          outbound: {
            departureTime: "",
            arrivalTime: "",
            airline: "",
            flightNumber: "",
          },
          returnFlight: {
            departureTime: "",
            arrivalTime: "",
            airline: "",
            flightNumber: "",
          },
        },
      });
    } else {
      console.log("Add mode - initializing empty form data");
      setFormData({
        country: "",
        startdate: "",
        enddate: "",
        price: "",
        airport: [],
        hotel: "",
        priceswitch: false,
        flightDetails: {
          outbound: {
            departureTime: "",
            arrivalTime: "",
            airline: "",
            flightNumber: "",
          },
          returnFlight: {
            departureTime: "",
            arrivalTime: "",
            airline: "",
            flightNumber: "",
          },
        },
      });
    }
    setOpenPriceFormDialog(true);
  };

  const handleClosePriceFormDialog = () => {
    setOpenPriceFormDialog(false);
    setCurrentPrice(null);
    setFormData({});
    setFormAlert({ message: "", type: "" });
    
    // If main dialog is also closed, reset the dealId ref
    if (!openPricesDialog) {
      dealIdRef.current = null;
      localStorage.removeItem('managePrices_dealId');
      console.log("Form dialog closed and main dialog not open, dealId ref and localStorage reset");
    }
  };

  const getDealId = () => {
    // Try ref first, then localStorage as backup
    return dealIdRef.current || localStorage.getItem('managePrices_dealId');
  };

  const handleSubmitPrice = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    const dealId = getDealId();
    console.log("Submit price - DealId from getDealId():", dealId);
    console.log("Submit price - DealId ref:", dealIdRef.current);
    console.log("Submit price - LocalStorage:", localStorage.getItem('managePrices_dealId'));
    console.log("Submit price - Form data:", formData);
    
    if (!dealId) {
      console.error("DealId not available from any source");
      setFormAlert({ message: "Deal information not available. Please close and reopen the dialog.", type: "red" });
      return;
    }

    setIsSubmitting(true);
    setFormAlert({ message: "", type: "" });

    try {
      console.log("Using dealId for API call:", dealId);
      
      if (currentPrice) {
        console.log("Updating price:", currentPrice._id);
        await axios.put(`/prices/deals/${dealId}/${currentPrice._id}`, formData);
        setFormAlert({ message: "Price updated successfully!", type: "green" });
        setDialogAlert({ message: "Price updated successfully!", type: "green" });
      } else {
        console.log("Creating new price");
        await axios.post(`/prices/deals/${dealId}`, formData);
        setFormAlert({ message: "Price created successfully!", type: "green" });
        setDialogAlert({ message: "Price created successfully!", type: "green" });
      }
      
      // Refresh the prices using dealId
      try {
        const response = await axios.get(`/prices/deals/${dealId}`);
        console.log("Refreshed deal prices:", response.data);
        setCurrentDeal(response.data);
        setDealPrices(response.data.prices);
      } catch (refreshError) {
        console.error("Error refreshing prices:", refreshError);
      }
      
      setTimeout(() => {
        handleClosePriceFormDialog();
      }, 1500);
      
    } catch (error) {
      console.error("Error saving price:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error saving price";
      setFormAlert({ message: errorMessage, type: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (priceId) => {
    const dealId = getDealId();
    console.log("Confirm delete - DealId from getDealId():", dealId);
    
    if (!dealId) {
      console.error("DealId not available for delete");
      setDialogAlert({ message: "Deal information not available. Please refresh and try again.", type: "red" });
      return;
    }
    
    setDeleteId(priceId);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    const dealId = getDealId();
    console.log("Handle delete - DealId from getDealId():", dealId);
    
    if (!dealId) {
      console.error("DealId not available for delete");
      setDialogAlert({ message: "Deal information not available. Please refresh and try again.", type: "red" });
      setOpenDeleteDialog(false);
      return;
    }

    try {
      console.log("Deleting price from deal:", dealId, "price:", deleteId);
      
      await axios.delete(`/prices/deals/${dealId}/${deleteId}`);
      setDialogAlert({ message: "Price deleted successfully!", type: "green" });
      
      const response = await axios.get(`/prices/deals/${dealId}`);
      setCurrentDeal(response.data);
      setDealPrices(response.data.prices);
    } catch (error) {
      console.error("Error deleting price:", error);
      setDialogAlert({ message: "Error deleting price", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAirportDisplay = (airport) => {
    if (typeof airport === "object" && airport.name) {
      return `${airport.name} (${airport.code || "N/A"})`;
    }
    return "Unknown Airport";
  };

  const getHotelDisplay = (hotel) => {
    if (typeof hotel === "object" && hotel.name) {
      return hotel.name;
    }
    return "Unknown Hotel";
  };

  // Auto-clear alerts after 3 seconds
  useEffect(() => {
    if (mainAlert.message) {
      const timer = setTimeout(() => {
        setMainAlert({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mainAlert]);

  useEffect(() => {
    if (dialogAlert.message) {
      const timer = setTimeout(() => {
        setDialogAlert({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [dialogAlert]);

  useEffect(() => {
    if (formAlert.message) {
      const timer = setTimeout(() => {
        setFormAlert({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [formAlert]);

  const today = new Date();
  const minStartDate = new Date(today);
  minStartDate.setDate(today.getDate() + 2);
  const minStartStr = minStartDate.toISOString().split("T")[0];

  return (
    <div className="h-screen w-full overflow-hidden px-4 py-6">
      {/* Main page alert - only for critical errors */}
      {mainAlert.message && (
        <Alert
          color={mainAlert.type}
          onClose={() => setMainAlert({ message: "", type: "" })}
          className="mb-4"
        >
          {mainAlert.message}
        </Alert>
      )}

      {/* Header */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Typography variant="h4" color="blue-gray">
          Manage Prices
        </Typography>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Input
              label="Search deals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      {/* Deals List */}
      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Typography>Loading...</Typography>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <Card
                key={deal._id}
                className="group cursor-pointer p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
                onClick={() => handleOpenPricesDialog(deal)}
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <Typography variant="h5" color="deep-orange" className="mb-2">
                      {deal.title}
                    </Typography>
                    
                    {deal.tag && (
                      <Chip
                        size="sm"
                        variant="filled"
                        color="blue"
                        value={deal.tag}
                        className="mb-2 w-fit"
                      />
                    )}

                    <Typography
                      variant="h6"
                      color="deep-orange"
                      className="flex items-center gap-1"
                    >
                      <MapPinIcon className="h-4 w-4" />
                      {deal.destination?.name}
                    </Typography>

                    {deal.destinations && deal.destinations.length > 0 && (
                      <Typography variant="small" color="gray" className="mt-1">
                        Multicenter: {deal.destinations.map(dest => dest.name).join(", ")}
                      </Typography>
                    )}

                    <Typography variant="small" color="blue" className="mt-2">
                      {deal.priceCount} price{deal.priceCount !== 1 ? "s" : ""} available
                    </Typography>
                  </div>

                  <div className="flex items-center">
                    <Tooltip content="View Prices" placement="top">
                      <Button variant="text" color="blue" className="p-2">
                        <EyeIcon strokeWidth={2} className="h-5 w-5" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              </Card>
            ))}

            {deals.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <Typography color="gray">
                  {searchQuery ? "No deals found matching your search" : "No deals available"}
                </Typography>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Prices Dialog */}
      <Dialog open={openPricesDialog} handler={handleClosePricesDialog} size="xl">
        <DialogHeader className="flex items-start justify-between">
          <div className="flex-1">
            <Typography variant="h5" className="text-deep-orange-400">
              {currentDeal?.dealTitle || "Loading..."}
            </Typography>
            <Typography variant="small" color="gray">
              {currentDeal?.destination?.name ? (
                <>
                  Destination: {currentDeal.destination.name}
                  {currentDeal?.destinations?.length > 0 && (
                    <span> | Multicenter: {currentDeal.destinations.map(dest => dest.name).join(", ")}</span>
                  )}
                </>
              ) : (
                "Loading destination information..."
              )}
            </Typography>
            
            {/* Dialog Alert */}
            {dialogAlert.message && (
              <Alert
                color={dialogAlert.type}
                onClose={() => setDialogAlert({ message: "", type: "" })}
                className="mt-3"
              >
                {dialogAlert.message}
              </Alert>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Tooltip content="Add New Price" placement="left">
              <Button
                variant="text"
                color="green"
                onClick={() => handleOpenPriceFormDialog()}
                className="p-2"
                disabled={!getDealId() || loading}
              >
                <PlusIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip content="Close" placement="right">
              <Button
                variant="text"
                color="purple"
                onClick={handleClosePricesDialog}
                className="p-2"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </div>
        </DialogHeader>

        <DialogBody className="h-[480px] overflow-y-auto bg-gray-50 p-4 scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Typography>Loading prices...</Typography>
            </div>
          ) : dealPrices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-300 bg-white">
                    <th className="p-3 text-left">Country</th>
                    <th className="p-3 text-left">Dates</th>
                    <th className="p-3 text-left">Price</th>
                    <th className="p-3 text-left">Airport</th>
                    <th className="p-3 text-left">Hotel</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dealPrices.map((price, index) => (
                    <tr key={price._id || index} className="border-b border-gray-100">
                      <td className="p-3">{price.country}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{formatDate(price.startdate)}</div>
                          <div className="text-gray-500">to {formatDate(price.enddate)}</div>
                        </div>
                      </td>
                      <td className="p-3 font-semibold">${price.price}</td>
                      <td className="p-3">
                        <div className="text-sm">
                          {Array.isArray(price.airport) 
                            ? price.airport.map(airport => getAirportDisplay(airport)).join(", ")
                            : getAirportDisplay(price.airport)
                          }
                        </div>
                      </td>
                      <td className="p-3">{getHotelDisplay(price.hotel)}</td>
                      <td className="p-3">
                        <Chip
                          size="sm"
                          variant="filled"
                          color={price.priceswitch ? "red" : "green"}
                          value={price.priceswitch ? "Disabled" : "Active"}
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Tooltip content="Edit" placement="top">
                            <Button
                              variant="text"
                              color="green"
                              onClick={() => handleOpenPriceFormDialog(price)}
                              className="p-1"
                              disabled={!getDealId() || loading}
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                          <Tooltip content="Delete" placement="top">
                            <Button
                              variant="text"
                              color="red"
                              onClick={() => confirmDelete(price._id)}
                              className="p-1"
                              disabled={!getDealId() || loading}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : currentDeal && currentDeal.dealId ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Typography color="gray" className="mb-4">
                No prices found for this deal
              </Typography>
              <Button
                variant="gradient"
                color="blue"
                onClick={() => handleOpenPriceFormDialog()}
                className="flex items-center gap-2"
                disabled={!getDealId() || loading}
              >
                <PlusIcon className="h-4 w-4" />
                Add First Price
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <Typography color="red">
                Failed to load deal information. Please close and try again.
              </Typography>
            </div>
          )}
        </DialogBody>
      </Dialog>

      {/* Price Form Dialog */}
      <Dialog open={openPriceFormDialog} handler={handleClosePriceFormDialog} size="lg">
        <DialogHeader className="flex flex-col items-start">
          <Typography variant="h5">
            {currentPrice ? "Edit Price" : "Add New Price"}
          </Typography>
          
          {/* Form Alert */}
          {formAlert.message && (
            <Alert
              color={formAlert.type}
              onClose={() => setFormAlert({ message: "", type: "" })}
              className="mt-3 w-full"
            >
              {formAlert.message}
            </Alert>
          )}
        </DialogHeader>
        
        <DialogBody className="h-[480px] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
          <form onSubmit={handleSubmitPrice} className="space-y-4">
            {/* Basic Price Info */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Select
                label="Country"
                value={formData.country}
                onChange={(value) => setFormData({ ...formData, country: value })}
                required
              >
                {countries.map((country) => (
                  <Option key={country} value={country}>
                    {country}
                  </Option>
                ))}
              </Select>

              <Input
                label="Start Date"
                type="date"
                min={minStartStr}
                value={formData.startdate}
                onChange={(e) => {
                  setFormData({ ...formData, startdate: e.target.value });
                  if (formData.enddate && new Date(formData.enddate) < new Date(e.target.value)) {
                    setFormData({ ...formData, startdate: e.target.value, enddate: e.target.value });
                  }
                }}
                required
              />

              <Input
                label="End Date"
                type="date"
                min={formData.startdate || minStartStr}
                value={formData.enddate}
                onChange={(e) => setFormData({ ...formData, enddate: e.target.value })}
                required
              />
            </div>

            <Input
              label="Price ($)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
            />

            {/* Hotel Selection */}
            <Select
              label="Hotel"
              value={formData.hotel}
              onChange={(value) => setFormData({ ...formData, hotel: value })}
              required
            >
              {hotels.map((hotel) => (
                <Option key={hotel._id} value={hotel._id}>
                  {hotel.name}
                </Option>
              ))}
            </Select>

            {/* Airport Selection */}
            <Typography variant="h6">Select Airports</Typography>
            <Menu placement="bottom-start">
              <MenuHandler>
                <Button variant="gradient" color="green" className="w-full text-left">
                  {formData.airport?.length > 0
                    ? `${formData.airport.length} airport(s) selected`
                    : "Select Airports"}
                </Button>
              </MenuHandler>
              <MenuList className="z-[100000] max-h-64 overflow-auto">
                {airports.map((airport) => (
                  <MenuItem
                    key={airport._id}
                    className="flex items-center gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      color="green"
                      ripple={false}
                      containerProps={{ className: "p-0" }}
                      className="hover:before:content-none"
                      checked={formData.airport?.includes(airport._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const isChecked = e.target.checked;
                        const updatedAirports = isChecked
                          ? [...(formData.airport || []), airport._id]
                          : (formData.airport || []).filter(id => id !== airport._id);
                        setFormData({ ...formData, airport: updatedAirports });
                      }}
                    />
                    <span>{airport.name} ({airport.code})</span>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            {/* Price Switch */}
            <div className="flex items-center">
              <Switch
                id="priceswitch"
                ripple={false}
                checked={formData.priceswitch}
                onChange={(e) => setFormData({ ...formData, priceswitch: e.target.checked })}
                className="h-full w-full checked:bg-black"
                containerProps={{ className: "w-11 h-6" }}
                circleProps={{ className: "before:hidden left-0.5 border-none" }}
              />
              <label className="ml-2" htmlFor="priceswitch">
                Price Switch (turn switch to black for off in website)
              </label>
            </div>

            {/* Flight Details */}
            <Typography variant="h6">Flight Details</Typography>
            <Typography variant="small" color="blue-gray">Outbound Flight</Typography>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input
                label="Departure Time"
                type="time"
                value={formData.flightDetails?.outbound?.departureTime || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    outbound: {
                      ...formData.flightDetails?.outbound,
                      departureTime: e.target.value
                    }
                  }
                })}
              />
              <Input
                label="Arrival Time"
                type="time"
                value={formData.flightDetails?.outbound?.arrivalTime || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    outbound: {
                      ...formData.flightDetails?.outbound,
                      arrivalTime: e.target.value
                    }
                  }
                })}
              />
              <Input
                label="Airline"
                value={formData.flightDetails?.outbound?.airline || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    outbound: {
                      ...formData.flightDetails?.outbound,
                      airline: e.target.value
                    }
                  }
                })}
              />
              <Input
                label="Flight Number"
                value={formData.flightDetails?.outbound?.flightNumber || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    outbound: {
                      ...formData.flightDetails?.outbound,
                      flightNumber: e.target.value
                    }
                  }
                })}
              />
            </div>

            <Typography variant="small" color="blue-gray">Return Flight</Typography>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input
                label="Departure Time"
                type="time"
                value={formData.flightDetails?.returnFlight?.departureTime || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    returnFlight: {
                      ...formData.flightDetails?.returnFlight,
                      departureTime: e.target.value
                    }
                  }
                })}
              />
              <Input
                label="Arrival Time"
                type="time"
                value={formData.flightDetails?.returnFlight?.arrivalTime || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    returnFlight: {
                      ...formData.flightDetails?.returnFlight,
                      arrivalTime: e.target.value
                    }
                  }
                })}
              />
              <Input
                label="Airline"
                value={formData.flightDetails?.returnFlight?.airline || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    returnFlight: {
                      ...formData.flightDetails?.returnFlight,
                      airline: e.target.value
                    }
                  }
                })}
              />
              <Input
                label="Flight Number"
                value={formData.flightDetails?.returnFlight?.flightNumber || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  flightDetails: {
                    ...formData.flightDetails,
                    returnFlight: {
                      ...formData.flightDetails?.returnFlight,
                      flightNumber: e.target.value
                    }
                  }
                })}
              />
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={handleClosePriceFormDialog}
            color="red"
            className="mr-2"
            variant="text"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitPrice} 
            color="green" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (currentPrice ? "Update" : "Create")}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} handler={setOpenDeleteDialog}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this price? This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-1"
          >
            Cancel
          </Button>
          <Button variant="gradient" color="red" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ManagePrices; 