import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  CardHeader,
  CardBody,
  Card,
  Input,
  Dialog,
  Radio,
  Switch,
  Select,
  Option,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Tooltip,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  HomeModernIcon,
  XMarkIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";

export function ManageHotel() {
  const [hotels, setHotels] = useState([]);
  const [boardBasis, setBoardBasis] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [imageUrls, setImageUrls] = useState([""]);
  const [openViewDialog, setOpenViewDialog] = useState(false); // State for view dialog
  const [currentHotel, setCurrentHotel] = useState(null);
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    location: "",
    locationId: "",
    about: "",
    facilities: [],
    roomfacilities: [],
    boardBasis: "",
    destination: "",
    externalBookingLink: "",
    images: [],
    roomType: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [hotelName, setHotelName] = useState("");
  const [mode, setMode] = useState("manual");
  const [inputValue, setInputValue] = useState(formData.locationId || "");
  const [imageError, setImageError] = useState("");
  const [newImages, setNewImages] = useState([]);
  const fileInputRef = React.useRef(null);

  // Add dropdown and search state for search functionality
  const [customDropdownOpen, setCustomDropdownOpen] = useState({
    boardBasis: false,
    destination: false,
  });

  const [dropdownSearch, setDropdownSearch] = useState({
    boardBasis: '',
    destination: '',
  });

  // Handle search functionality for dropdowns
  const handleSearchChange = (dropdown, value) => {
    setDropdownSearch(prev => ({
      ...prev,
      [dropdown]: value
    }));
  };

  // Helper function for validating image
  const validateImage = (file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, and PNG files are allowed";
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }

    return "";
  };

  // Function to validate all images in a file list
  const validateImages = (files) => {
    for (let i = 0; i < files.length; i++) {
      const error = validateImage(files[i]);
      if (error) {
        return error;
      }
    }
    return "";
  };

  useEffect(() => {
    setInputValue(formData.locationId || "");
  }, [formData.locationId]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (mode === "url") {
      const match = val.match(/-d(\d+)/);
      const extracted = match ? match[1] : "";
      setFormData({ ...formData, locationId: extracted });
    } else {
      if (/^\d*$/.test(val)) {
        setFormData({ ...formData, locationId: val });
      }
    }
  };

  const toggleMode = () => {
    const newMode = mode === "manual" ? "url" : "manual";
    setMode(newMode);
    setInputValue(newMode === "manual" ? formData.locationId || "" : "");
    if (newMode === "url") {
      setFormData({ ...formData, locationId: "" });
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrls.length < 6) {
      // Check if the current length is less than 6
      setImageUrls([...imageUrls, ""]); // Add a new empty string to the array
    }
  };

  const handleImageUrlChange = (index, value) => {
    const updatedUrls = [...imageUrls];
    updatedUrls[index] = value; // Update the specific index with the new value
    setImageUrls(updatedUrls);
  };

  const handleRemoveImageUrl = (index) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index); // Remove the URL at the specified index
    setImageUrls(updatedUrls);
  };
  const handleRemoveImage = async (indexToRemove, imageUrl) => {
    try {
      const HotelId = formData._id; // adjust this as per your data
      console.log("Removing image from hotel ID:", HotelId);
      await axios.delete(`/hotels/image/${HotelId}`, {
        data: { imageUrl },
      });

      // Optimistically update the UI
      setFormData((prevData) => ({
        ...prevData,
        images: prevData.images.filter((_, index) => index !== indexToRemove),
      }));
    } catch (error) {
      console.error("Error deleting image:", error);
      setAlert({
        message: error.response?.data?.message || "Error deleting image",
        type: "red"
      });
    }
  };
  useEffect(() => {
    fetchHotels();
    fetchBoardBasis();
    fetchDestinations();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await axios.get("/hotels");
      setHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setAlert({ message: "Error fetching hotels", type: "red" });
    }
  };

  const fetchBoardBasis = async () => {
    try {
      const response = await axios.get("/boardbasis/dropdown-boardbasis");
      setBoardBasis(response.data);
    } catch (error) {
      console.error("Error fetching board basis:", error);
      setAlert({ message: "Error fetching board basis", type: "red" });
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await axios.get("/destinations/destinations");
      setDestinations(response.data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setAlert({ message: "Error fetching destinations", type: "red" });
    }
  };

  const handleOpenDialog = (hotel = null) => {
    setCurrentHotel(hotel);
    setFormData(
      hotel
        ? {
          _id: hotel._id,
          name: hotel.name,
          location: hotel.location,
          locationId: hotel.locationId,
          about: hotel.about,
          facilities: hotel.facilities,
          roomfacilities: hotel.roomfacilities || [],
          boardBasis: hotel.boardBasis ? hotel.boardBasis._id : "",
          destination: hotel.destination ? hotel.destination._id : "",
          externalBookingLink: hotel.externalBookingLink,
          images: hotel.images,
          roomType: hotel.roomType || "",
        }
        : {
          name: "",
          location: "",
          locationId: "",
          about: "",
          facilities: [],
          roomfacilities: [],
          boardBasis: "",
          destination: "",
          externalBookingLink: "",
          images: [],
          roomType: "",
        },
    );
    setImageUrls(hotel ? hotel.images : [""]);
    setImageError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentHotel(null);
    setAlert({ message: "", type: "" });
    setNewImages([]); // Reset newImages when closing dialog
  };

  const handleViewHotel = (hotel) => {
    setCurrentHotel(hotel);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setCurrentHotel(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if there's an image error before proceeding
    if (imageError) {
      setAlert({ message: imageError, type: "red" });
      return;
    }

    setLoading(true);
    try {
      console.log(formData);
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("data", JSON.stringify(formData));
      if (newImages && newImages.length > 0) {
        for (let i = 0; i < newImages.length; i++) {
          formDataToSubmit.append("images", newImages[i]);
        }
      }
      if (currentHotel) {
        await axios.put(`/hotels/${currentHotel._id}`, formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setAlert({ message: "Hotel updated successfully!", type: "green" });
      } else {
        await axios.post("/hotels", formDataToSubmit, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setAlert({ message: "Hotel added successfully!", type: "green" });
      }
      fetchHotels();
      setNewImages([]); // Reset newImages after successful submission
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving hotel:", error);
      setAlert({ message: error.response?.data?.message || "Error saving hotel", type: "red" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setHotelName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/hotels/${id}`);
      setAlert({ message: "Hotel deleted successfully!", type: "green" });
      fetchHotels();
    } catch (error) {
      console.error("Error deleting hotel:", error);
      setAlert({ message: "Error deleting hotel", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
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
        <Button onClick={() => handleOpenDialog()} color="blue">
          Add Hotel
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {hotels.map((hotel) => (
            <Card
              key={hotel._id}
              className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Typography
                    variant="h5"
                    color="deep-orange"
                    className="flex items-center justify-start gap-2"
                  >
                    <HomeModernIcon strokeWidth={2} className="h-5 w-5" />
                    {hotel.name}
                  </Typography>
                  <Typography className="mt-1 font-medium text-blue-500">
                    {hotel.location}
                  </Typography>
                </div>

                <div className="flex items-center gap-4">
                  <Tooltip
                    content="View"
                    placement="top"
                    className="font-medium text-blue-600"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      variant="text"
                      color="blue"
                      onClick={() => handleViewHotel(hotel)}
                      className="p-2"
                    >
                      <EyeIcon strokeWidth={2} className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Edit"
                    placement="top"
                    className="font-medium text-green-600"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      variant="text"
                      color="green"
                      onClick={() => handleOpenDialog(hotel)}
                      className="p-2"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Delete"
                    placement="top"
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
                      onClick={() => confirmDelete(hotel._id, hotel.name)}
                      className="p-2"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Add/Edit Hotel Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader className="flex items-center justify-between">
          {currentHotel ? "Edit Hotel" : "Add Hotel"}{" "}
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Hotel Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              required
            />
            {/* <Input
              label="Location ID"
              value={formData.locationId}
              onChange={(e) =>
                setFormData({ ...formData, locationId: e.target.value })
              }
              required
            /> */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  Manual
                </span>
                <Switch
                  id="custom-switch-component"
                  checked={mode === "url"}
                  onChange={toggleMode}
                  ripple={false}
                  className="h-full w-full checked:bg-blue-500"
                  containerProps={{ className: "w-11 h-6" }}
                  circleProps={{
                    className: "before:hidden left-0.5 border-none",
                  }}
                />
                <span className="text-sm font-medium text-gray-700">
                  From URL
                </span>
              </div>

              <Input
                label={
                  mode === "url" ? "TripAdvisor URL" : "Manual Location ID"
                }
                value={inputValue}
                onChange={handleInputChange}
                required
              />
            </div>
            <Input
              label="About"
              value={formData.about}
              onChange={(e) =>
                setFormData({ ...formData, about: e.target.value })
              }
            />
            {/* Board Basis Dropdown */}
            <div className="relative">
              <Typography variant="h6">Board Basis</Typography>
              <button
                type="button"
                className="w-full flex items-center justify-between bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => setCustomDropdownOpen(prev => ({
                  ...prev,
                  boardBasis: !prev.boardBasis
                }))}
              >
                <span className="text-left">
                  {formData.boardBasis ? 
                    boardBasis.find(basis => basis._id === formData.boardBasis)?.name || "Select Board Basis"
                    : "Select Board Basis"}
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {customDropdownOpen.boardBasis && (
                <>
                  <div 
                    className="absolute z-[100000] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col"
                  >
                    {/* Search input */}
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Search board basis..."
                        value={dropdownSearch.boardBasis}
                        onChange={(e) => handleSearchChange('boardBasis', e.target.value)}
                      />
                    </div>
                    
                    {/* Options list with scroll */}
                    <div className="overflow-y-auto max-h-48">
                      {boardBasis
                        .filter(basis => 
                          basis.name.toLowerCase().includes(dropdownSearch.boardBasis.toLowerCase())
                        )
                        .map((basis) => (
                          <div 
                            key={basis._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setFormData({ ...formData, boardBasis: basis._id });
                              setCustomDropdownOpen(prev => ({...prev, boardBasis: false}));
                            }}
                          >
                            <span className="text-sm text-gray-700 flex-1">
                              {basis.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div 
                    className="fixed inset-0 z-[10000]" 
                    onClick={() => setCustomDropdownOpen(prev => ({...prev, boardBasis: false}))}
                  ></div>
                </>
              )}
            </div>

            {/* Destination Dropdown */}
            <div className="relative">
              <Typography variant="h6">Destination</Typography>
              <button
                type="button"
                className="w-full flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => setCustomDropdownOpen(prev => ({
                  ...prev,
                  destination: !prev.destination
                }))}
              >
                <span className="text-left">
                  {formData.destination ? 
                    destinations.find(dest => dest._id === formData.destination)?.name || "Select Destination"
                    : "Select Destination"}
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {customDropdownOpen.destination && (
                <>
                  <div 
                    className="absolute z-[100000] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col"
                  >
                    {/* Search input */}
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Search destinations..."
                        value={dropdownSearch.destination}
                        onChange={(e) => handleSearchChange('destination', e.target.value)}
                      />
                    </div>
                    
                    {/* Options list with scroll */}
                    <div className="overflow-y-auto max-h-48">
                      {destinations
                        .filter(destination => 
                          destination.name.toLowerCase().includes(dropdownSearch.destination.toLowerCase())
                        )
                        .map((destination) => (
                          <div 
                            key={destination._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setFormData({ ...formData, destination: destination._id });
                              setCustomDropdownOpen(prev => ({...prev, destination: false}));
                            }}
                          >
                            <span className="text-sm text-gray-700 flex-1">
                              {destination.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div 
                    className="fixed inset-0 z-[10000]" 
                    onClick={() => setCustomDropdownOpen(prev => ({...prev, destination: false}))}
                  ></div>
                </>
              )}
            </div>

            <Input
              label="Room Type"
              value={formData.roomType}
              onChange={(e) =>
                setFormData({ ...formData, roomType: e.target.value })
              }
            />
            <Typography variant="h6">Facilities</Typography>
            {formData.facilities.map((facility, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <Input
                  label={`Facility ${index + 1}`}
                  value={facility}
                  onChange={(e) => {
                    const updated = [...formData.facilities];
                    updated[index] = e.target.value;
                    setFormData({ ...formData, facilities: updated });
                  }}
                  className="flex-1"
                />
                {formData.facilities.length > 1 && (
                  <Button
                    size="sm"
                    color="red"
                    onClick={() => {
                      const updated = formData.facilities.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, facilities: updated });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              size="sm"
              color="blue"
              onClick={() =>
                setFormData({
                  ...formData,
                  facilities: [...formData.facilities, ""],
                })
              }
            >
              + Add Facility
            </Button>

            {/* Room Facilities Section */}
            <Typography variant="h6">Room Facilities</Typography>
            {formData.roomfacilities && formData.roomfacilities.map((roomFacility, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <Input
                  label={`Room Facility ${index + 1}`}
                  value={roomFacility}
                  onChange={(e) => {
                    const updated = [...formData.roomfacilities];
                    updated[index] = e.target.value;
                    setFormData({ ...formData, roomfacilities: updated });
                  }}
                  className="flex-1"
                />
                {formData.roomfacilities.length > 1 && (
                  <Button
                    size="sm"
                    color="red"
                    onClick={() => {
                      const updated = formData.roomfacilities.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, roomfacilities: updated });
                    }}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              size="sm"
              color="orange"
              onClick={() =>
                setFormData({
                  ...formData,
                  roomfacilities: [...(formData.roomfacilities || []), ""],
                })
              }
            >
              + Add Room Facility
            </Button>





            <Input
              label="External Booking Link"
              value={formData.externalBookingLink}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  externalBookingLink: e.target.value,
                })
              }
            />
            {currentHotel && (
              <Card className="mt-6 border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-3 mt-3">
                  <Typography variant="h6" className="text-white">
                    Images
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(formData.images) &&
                      formData.images.length > 0 ? (
                      formData.images.map((image, index) => (
                        <div key={index} className="group relative h-20 w-20">
                          <img
                            src={image}
                            alt={`Hotel Image ${index + 1}`}
                            className="h-full w-full rounded object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index, image)}
                            className="absolute right-0 top-0 flex h-5 w-5 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-800"
                            title="Remove Image"
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <Typography variant="paragraph" className="text-black">
                        No images available.
                      </Typography>
                    )}
                  </div>
                </CardBody>
              </Card>
            )}
            {/* Image Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Upload Images (JPG, JPEG, PNG only, max 5MB each, up to 10 images total)
              </label>
              <Input
                type="file"
                multiple
                label="Upload Images"
                ref={fileInputRef}
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  // Allow 10 images for both new and existing hotels
                  const maxImages = 10;
                  if (
                    files.length + newImages.length + formData.images.length >
                    maxImages
                  ) {
                    setImageError(`You can only upload up to ${maxImages} images total.`);
                    e.target.value = ""; // reset the input
                    return;
                  }

                  // Validate image formats and sizes
                  const error = validateImages(files);
                  if (error) {
                    setImageError(error);
                    e.target.value = ""; // reset the input
                    return;
                  }

                  // Clear any previous errors
                  setImageError("");
                  setNewImages((prevImages) => [...prevImages, ...files]);
                }}
              />
              {imageError && (
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-red-500">{imageError}</p>
                  <Button
                    size="sm"
                    color="red"
                    variant="text"
                    onClick={() => {
                      setImageError("");
                      setNewImages([]); // Clear only the new images
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""; // Clear the file input
                      }
                    }}
                  >
                    Clear Images
                  </Button>
                </div>
              )}
              {newImages.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">
                    {newImages.length} new image(s) selected for upload
                  </p>
                </div>
              )}
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCloseDialog} color="red" variant="text">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="green" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* View Hotel Dialog */}
      <Dialog open={openViewDialog} handler={handleCloseViewDialog} size="md">
        <DialogHeader className="flex items-start justify-between">
          <Typography variant="h5" className="flex items-center gap-2">
            <HomeModernIcon className="h-6 w-6 text-blue-500" />
            {currentHotel ? currentHotel.name : "Hotel Details"}
          </Typography>
          <div className="flex gap-2">
            <Tooltip
              content="Edit"
              placement="left"
              className="z-[50000] font-medium text-green-600"
            >
              <Button
                variant="text"
                className="p-2"
                color="green"
                onClick={() => {
                  handleOpenDialog(currentHotel);
                  handleCloseViewDialog();
                }}
                title="Edit"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="Delete"
              placement="top"
              className="z-[50000] font-medium text-red-600"
            >
              <Button
                variant="text"
                className="p-2"
                color="red"
                onClick={() =>
                  confirmDelete(currentHotel._id, currentHotel.name)
                }
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="Close"
              placement="right"
              className="z-[50000] font-medium text-purple-600"
            >
              <Button
                variant="text"
                className="p-2"
                color="purple"
                onClick={handleCloseViewDialog}
                title="Close"
              >
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
          </div>
        </DialogHeader>

        <DialogBody className="max-h-[80vh] space-y-4 overflow-y-auto px-4">
          {currentHotel && (
            <div className="space-y-4">
              <Typography variant="h5" color="orange">
                📍 Location:
              </Typography>
              <Typography color="black" variant="h6" className="pl-2">
                {currentHotel.location}
              </Typography>

              <Typography variant="h5" color="orange">
                🆔 Location ID:
              </Typography>
              <Typography
                color="black"
                variant="h6"
                className="ml-8 w-fit rounded-md bg-blue-200 px-2 py-1 pl-2"
              >
                {currentHotel.locationId}
              </Typography>

              <Typography variant="h5" color="orange">
                ℹ️ About:
              </Typography>
              <Typography
                color="black"
                variant="h6"
                className="pl-2 text-justify"
              >
                {currentHotel.about}
              </Typography>

              {currentHotel.roomType && (
                <>
                  <Typography variant="h5" color="orange">
                    🏨 Room Type:
                  </Typography>
                  <Typography color="black" variant="h6" className="pl-2">
                    {currentHotel.roomType}
                  </Typography>
                </>
              )}

              <Typography variant="h5" color="orange">
                🏅 TripAdvisor:
              </Typography>
              <Typography color="black" variant="h6" className="pl-2">
                ⭐ {currentHotel.tripAdvisorRating} / 5 from{" "}
                {currentHotel.tripAdvisorReviews} reviews
              </Typography>

              <Typography variant="h5" color="orange">
                🎯 Facilities:
              </Typography>
              <ul className="text-md list-disc pl-6 font-semibold text-black">
                {currentHotel.facilities.map((facility, i) => (
                  <li key={i}>{facility}</li>
                ))}
              </ul>

              {currentHotel.roomfacilities && currentHotel.roomfacilities.length > 0 && (
                <>
                  <Typography variant="h5" color="orange">
                    🏠 Room Facilities:
                  </Typography>
                  <ul className="text-md list-disc pl-6 font-semibold text-black">
                    {currentHotel.roomfacilities.map((roomFacility, i) => (
                      <li key={i}>{roomFacility}</li>
                    ))}
                  </ul>
                </>
              )}

              {currentHotel.boardBasis && (
                <>
                  <Typography variant="h5" color="orange">
                    🍽️ Board Basis:
                  </Typography>
                  <Typography color="black" variant="h6" className="pl-2">
                    {currentHotel.boardBasis.name}
                  </Typography>
                </>
              )}

              {currentHotel.destination && (
                <>
                  <Typography variant="h5" color="orange">
                    🌍 Destination:
                  </Typography>
                  <Typography color="black" variant="h6" className="pl-2">
                    {currentHotel.destination.name}
                  </Typography>
                </>
              )}

              <Typography variant="h5" color="orange">
                🔗 External Booking:
              </Typography>
              <a
                href={currentHotel.externalBookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block pl-2 text-blue-500 underline"
              >
                {currentHotel.externalBookingLink}
              </a>

              <Typography variant="h5" color="orange">
                🖼️ Images:
              </Typography>
              <div className="flex flex-wrap gap-2 pl-2">
                {currentHotel.images
                  .concat(currentHotel.tripAdvisorPhotos || [])
                  .map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Hotel Image ${i + 1}`}
                      className="h-20 w-20 rounded border object-cover"
                    />
                  ))}
              </div>

              <Typography variant="h5" color="orange">
                🛏️ Room Types:
              </Typography>
              <ul className="text-md list-disc pl-6 font-semibold text-black">
                {currentHotel.rooms.map((room) => (
                  <li key={room._id}>
                    {room.numberofrooms} rooms for up to {room.guestCapacity}{" "}
                    guests
                  </li>
                ))}
              </ul>

              <Typography variant="h5" color="orange">
                📝 Latest Reviews:
              </Typography>
              <div className="space-y-3 pl-2">
                {currentHotel.tripAdvisorLatestReviews.map((review) => (
                  <div
                    key={review._id}
                    className="rounded border border-gray-200 p-2 shadow-sm"
                  >
                    <Typography className="mb-1 w-fit rounded-lg bg-black/90 px-2 py-1 text-sm text-yellow-500">
                      ⭐ {review.rating} / 5
                    </Typography>
                    <Typography className="whitespace-pre-line text-sm text-black">
                      {review.review}
                    </Typography>
                  </div>
                ))}
              </div>

              <Typography variant="h5" color="orange">
                🌐 TripAdvisor Profile:
              </Typography>
              <a
                href={currentHotel.tripAdvisorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block pl-2 text-blue-500 underline"
              >
                {currentHotel.tripAdvisorLink}
              </a>
            </div>
          )}
        </DialogBody>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} handler={setOpenDeleteDialog}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-600">{hotelName}</span>?
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
          <Button
            variant="gradient"
            color="red"
            onClick={() => handleDelete(deleteId)}
          >
            Delete
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default ManageHotel;
