import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  Button,
  Card,
  Checkbox,
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
  Progress,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";
import { MapPinIcon, StopCircleIcon } from "@heroicons/react/24/solid";

export const ManageDeals = () => {
  const [deals, setDeals] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [boardBasis, setBoardBasis] = useState([]);
  const [previewImages, setPreviewImages] = useState([]); // for showing all images
  const [availablePlaces, setAvailablePlaces] = useState([]); // Store available places for selected destination
  const [destinationPlaces, setDestinationPlaces] = useState({}); // Store places for each destination
  const [selectedDestinationForPlaces, setSelectedDestinationForPlaces] = useState(null); // Track which destination we're selecting places for
  const [destinationSelectedPlaces, setDestinationSelectedPlaces] = useState({}); // Map of destination ID to selected places

  const [airports, setAirports] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [holidaycategories, setHolidayCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [currentDeal, setCurrentDeal] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    availableCountries: [],
    destination: "",
    destinations: [],
    selectedPlaces: [], // Array to store selected place IDs
    days: 0,
    rooms: 0,
    guests: 0,
    distanceToCenter: "",
    distanceToBeach: "",
    isTopDeal: false,
    isHotdeal: false,
    isFeatured: false,
    boardBasis: "",
    hotels: [],
    holidaycategories: [],
    itinerary: [{ title: "", description: "", bulletpoints: [""] }],
    whatsIncluded: [""],
    exclusiveAdditions: [""],
    termsAndConditions: [""],
    tag: "",
    LowDeposite: "",
    images: [],
    videos: [],
    prices: [
      {
        country: "",
        priceswitch: false,
        airport: [],
        hotel: "",
        startdate: "",
        enddate: "",
        price: 0,
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
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [dealName, setDealName] = useState("");
  const [newImages, setNewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [imageError, setImageError] = useState("");
  const [videoError, setVideoError] = useState("");
  const [newVideos, setNewVideos] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [deletedVideos, setDeletedVideos] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [processingInterval, setProcessingInterval] = useState(null);

  // Add this state for custom dropdowns
  const [customDropdownOpen, setCustomDropdownOpen] = useState({
    holidayCategories: false,
    destinations: false,
    hotels: false,
    places: false, // Add places dropdown state
    primaryDestination: false, // Add primary destination dropdown state
    priceAirports: {} // Will store airport dropdown states by price index
  });

  // Add search state for each dropdown
  const [dropdownSearch, setDropdownSearch] = useState({
    destinations: '',
    holidayCategories: '',
    hotels: '',
    places: '', // Add places search state
    primaryDestination: '', // Add primary destination search state
    priceAirports: {}
  });

  // Add these state variables after the other state declarations
  const [expandedPrices, setExpandedPrices] = useState({});
  const [pricesPagination, setPricesPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5
  });
  const [viewPricesPagination, setViewPricesPagination] = useState({
    currentPage: 1,
    itemsPerPage: 5
  });

  const fileInputRef = useRef(null);

  // Add this function to toggle the expanded state of a price
  const togglePriceExpand = (index) => {
    setExpandedPrices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Add this function to handle pagination
  const handlePricesPageChange = (newPage) => {
    setPricesPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };
  
  useEffect(() => {
    fetchDeals();
    fetchDestinations();
    fetchAirports();
    fetchHotels();
    fetchHolidays();
    fetchBoardBasis();
  }, []);

  const fetchDeals = async () => {
    try {
      const response = await axios.get("/deals/admin");
      setDeals(response.data);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setAlert({ message: "Error fetching deals", type: "red" });
    }
  };

  const fetchDestinations = async () => {
    try {
      // Get destinations with their places
      const response = await axios.get("/destinations/destinations");
      setDestinations(response.data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setAlert({ message: "Error fetching destinations", type: "red" });
    }
  };

  const fetchBoardBasis = async () => {
    try {
      const response = await axios.get("/boardbasis/dropdown-boardbasis");
      setBoardBasis(response.data);
    } catch (error) {
      console.error("Error fetching boardbasis:", error);
      setAlert({ message: "Error fetching boardbasis", type: "red" });
    }
  };

  const fetchAirports = async () => {
    try {
      const response = await axios.get("/airport");
      setAirports(response.data);
    } catch (error) {
      console.error("Error fetching airports:", error);
      setAlert({ message: "Error fetching airports", type: "red" });
    }
  };

  const fetchHotels = async () => {
    try {
      const response = await axios.get("/hotels");
      setHotels(response.data);
    } catch (error) {
      console.error("Error fetching hotels:", error);
      setAlert({ message: "Error fetching hotels", type: "red" });
    }
  };

  const fetchHolidays = async () => {
    try {
      const response = await axios.get("/holidays/dropdown-holiday");
      setHolidayCategories(response.data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setAlert({ message: "Error fetching holidays", type: "red" });
    }
  };

  // Function to fetch places for a specific destination
  const fetchPlacesForDestination = async (destinationId) => {
    if (!destinationId) return;
    
    console.log("Fetching places for destination:", destinationId);
    
    try {
      // First check if we already have places for this destination in our cache
      if (destinationPlaces[destinationId]) {
        console.log("Using cached places:", destinationPlaces[destinationId]);
        setAvailablePlaces(destinationPlaces[destinationId]);
        return;
      }
      
      // Otherwise fetch from the server
      console.log("Making API call to fetch places");
      const response = await axios.get(`/destinations/${destinationId}/places`);
      console.log("Places API response:", response);
      const places = response.data;
      
      // Log each place with its ID and name for debugging
      console.log("Places data:", places);
      places.forEach(place => {
        console.log(`Place: ${place.name}, ID: ${place._id}`);
      });
      
      // Update our cache
      setDestinationPlaces(prev => ({
        ...prev,
        [destinationId]: places
      }));
      
      // Update available places
      setAvailablePlaces(places);
    } catch (error) {
      console.error(`Error fetching places for destination ${destinationId}:`, error);
      console.log("Error response:", error.response);
      setAlert({ message: "Error fetching places", type: "red" });
      setAvailablePlaces([]);
    }
  };

  const handleOpenDialog = (deal = null) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setCurrentDeal(deal);
    
    // Debug destinations and ensure proper mapping
    let destinationIds = [];
    if (deal && deal.destinations) {
      console.log("Original destinations:", deal.destinations);
      
      // Ensure destinations are properly mapped to IDs
      destinationIds = deal.destinations.map(dest => 
        typeof dest === 'object' ? dest._id : dest
      );
      console.log("Mapped destination IDs:", destinationIds);
    }
    
    setDeletedImages([]);
    setDeletedVideos([]);
    
    const initialFormData = {
      title: "",
      description: "",
      availableCountries: [],
      destination: "",
      destinations: [],
      selectedPlaces: [], // Array to store selected place IDs
      days: 0,
      rooms: 0,
      guests: 0,
      distanceToCenter: "",
      distanceToBeach: "",
      isTopDeal: false,
      isHotdeal: false,
      isFeatured: false,
      boardBasis: "",
      hotels: [],
      holidaycategories: [],
      itinerary: [{ title: "", description: "", bulletpoints: [""] }],
      whatsIncluded: [""],
      exclusiveAdditions: [""],
      termsAndConditions: [""],
      tag: "",
      LowDeposite: "",
      images: [],
      videos: [],
      prices: [
        {
          country: "",
          priceswitch: false,
          airport: [],
          hotel: "",
          startdate: "",
          enddate: "",
          price: 0,
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
        },
      ],
    };
    
    const newFormData = deal
        ? {
            _id: deal._id,
            title: deal.title,
            description: deal.description,
            availableCountries: deal.availableCountries || [],
            destination: deal.destination ? deal.destination._id : "" || "",
            destinations: deal && deal.destinations ? destinationIds : [],
            selectedPlaces: deal.selectedPlaces || [], // Add selected places
            days: deal.days || 0,
            rooms: deal.rooms || 0,
            guests: deal.guests || 0,
            distanceToCenter: deal.distanceToCenter || "",
            distanceToBeach: deal.distanceToBeach || "",
            isTopDeal: deal.isTopDeal || false,
            isHotdeal: deal.isHotdeal || false,
            isFeatured: deal.isFeatured || false,
            boardBasis: deal.boardBasis ? deal.boardBasis._id : "" || "",
            hotels: Array.isArray(deal.hotels)
              ? deal.hotels.map((h) => (typeof h === "object" ? h._id : h))
              : [],
            holidaycategories: Array.isArray(deal.holidaycategories)
              ? deal.holidaycategories.map((cat) =>
                  typeof cat === "object" ? cat._id : cat,
                )
              : [],
            itinerary: deal.itinerary ? deal.itinerary.map(item => ({
              title: item.title || "",
              description: item.description || "",
              bulletpoints: item.bulletpoints || [""]
            })) : [{ title: "", description: "", bulletpoints: [""] }],
            whatsIncluded: deal.whatsIncluded || [""],
            exclusiveAdditions: deal.exclusiveAdditions || [""],
            termsAndConditions: deal.termsAndConditions || [""],
            tag: deal.tag || "",
            LowDeposite: deal.LowDeposite || "",
            images: deal.images || [],
            videos: deal.videos || [],
            prices: deal.prices && deal.prices.length > 0 ? deal.prices.map((price) => ({
              ...price,
              airport: Array.isArray(price.airport)
                ? price.airport.map((a) => (typeof a === "object" ? a._id : a))
                : [],
              startdate: price.startdate ? price.startdate.split("T")[0] : "", // Convert to YYYY-MM-DD
              enddate: price.enddate ? price.enddate.split("T")[0] : "", // Convert to YYYY-MM-DD
              hotel:
                price.hotel && typeof price.hotel === "object"
                  ? price.hotel._id
                  : price.hotel,
            })) : [
              {
                country: "",
                priceswitch: false,
                airport: [],
                hotel: "",
                startdate: "",
                enddate: "",
                price: 0,
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
              },
            ],
        }
        : initialFormData; // Use the initial empty form data instead of previous state
    
    setFormData(newFormData);
    
    // Update available places if a destination is selected
    if (newFormData.destination) {
      fetchPlacesForDestination(newFormData.destination);
    }
    
    // Initialize destinationSelectedPlaces if editing an existing deal
    if (deal && deal.destinations) {
      const initialDestinationPlaces = {};
      
      // For each destination in multicenter, extract its places from selectedPlaces
      deal.destinations.forEach(dest => {
        const destId = typeof dest === 'object' ? dest._id : dest;
        
        // Find places that belong to this destination
        const destPlaces = deal.selectedPlaces ? deal.selectedPlaces.filter(place => {
          if (place.destinationId) {
            const placeDestId = typeof place.destinationId === 'object'
              ? place.destinationId._id.toString()
              : place.destinationId.toString();
            return placeDestId === destId.toString();
          }
          return false;
        }) : [];
        
        console.log(`Found ${destPlaces.length} places for destination ${destId}:`, destPlaces);
        initialDestinationPlaces[destId] = destPlaces;
      });
      
      setDestinationSelectedPlaces(initialDestinationPlaces);
    } else {
      // Reset destinationSelectedPlaces when adding a new deal
      setDestinationSelectedPlaces({});
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setCurrentDeal(null);
    setNewImages([]);
    setNewVideos([]);
    setDeletedImages([]);
    setDeletedVideos([]);
    setOpenDialog(false);
    setImageError("");
    setVideoError("");
  };

  const handleOpenViewDialog = (deal) => {
    console.log("Opening view dialog with deal:", deal);
    
    // Log detailed information about selected places
    console.log("Selected places:", deal.selectedPlaces);
    if (deal.selectedPlaces && deal.selectedPlaces.length > 0) {
      deal.selectedPlaces.forEach((place, idx) => {
        console.log(`Place ${idx+1}:`, place);
        if (place.placeId) {
          console.log(`  placeId: ${typeof place.placeId === 'object' ? place.placeId._id : place.placeId}`);
          if (typeof place.placeId === 'object' && place.placeId.name) {
            console.log(`  name: ${place.placeId.name}`);
          }
        }
      });
    }
    
    setCurrentDeal(deal);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setCurrentDeal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Combine places from primary destination and multicenter destinations
      let allSelectedPlaces = [];
      
      // Add primary destination places
      allSelectedPlaces = [...formData.selectedPlaces];
      
      // Add multicenter destination places
      Object.entries(destinationSelectedPlaces).forEach(([destId, places]) => {
        if (places && places.length > 0) {
          allSelectedPlaces = [...allSelectedPlaces, ...places];
        }
      });
      
      // Remove any duplicates by placeId
      allSelectedPlaces = allSelectedPlaces.filter((place, index, self) => {
        const placeId = place.placeId ? 
          (typeof place.placeId === 'object' ? place.placeId._id : place.placeId) : 
          place;
        return index === self.findIndex(p => {
          const pId = p.placeId ? 
            (typeof p.placeId === 'object' ? p.placeId._id : p.placeId) : 
            p;
          return pId.toString() === placeId.toString();
        });
      });

      // Create form data
      const formDataToSend = new FormData();
      
      console.log("DEBUG - newImages:", newImages);
      console.log("DEBUG - newImages length:", newImages.length);
      console.log("DEBUG - newVideos:", newVideos);
      console.log("DEBUG - newVideos length:", newVideos.length);
      
      // Add all the form fields
      const dataToSend = {
        ...formData,
        selectedPlaces: allSelectedPlaces // Use the combined places
      };
      
      // Add images
      if (newImages.length > 0) {
        newImages.forEach((image, index) => {
          console.log(`DEBUG - Adding image ${index}:`, image.name);
          formDataToSend.append("images", image, image.name);
        });
      }
      
      // Add videos
      if (newVideos.length > 0) {
        newVideos.forEach((video, index) => {
          console.log(`DEBUG - Adding video ${index}:`, video.name);
          formDataToSend.append("videos", video, video.name);
        });
      }
      
      // Add the rest of the data
      formDataToSend.append("data", JSON.stringify(dataToSend));
      
      // Log FormData contents (this won't show the actual files but will confirm they're attached)
      console.log("DEBUG - FormData entries:");
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0], pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
      }
      
      // Send the request
      if (currentDeal) {
        console.log("DEBUG - Sending PUT request to update deal");
        try {
          const response = await axios.put(`/deals/${currentDeal._id}`, formDataToSend);
          console.log("DEBUG - PUT request successful:", response.data);
          setAlert({ message: "Deal updated successfully!", type: "green" });
        } catch (error) {
          console.error("DEBUG - PUT request failed:", error.response || error);
          setAlert({ message: `Error updating deal: ${error.response?.data?.message || error.message}`, type: "red" });
        }
      } else {
        console.log("DEBUG - Sending POST request to create deal");
        try {
          const response = await axios.post("/deals", formDataToSend);
          console.log("DEBUG - POST request successful:", response.data);
          setAlert({ message: "Deal created successfully!", type: "green" });
        } catch (error) {
          console.error("DEBUG - POST request failed:", error.response || error);
          setAlert({ message: `Error creating deal: ${error.response?.data?.message || error.message}`, type: "red" });
        }
      }
      
      // Reset form and close dialog
      handleCloseDialog();
      fetchDeals();
    } catch (error) {
      console.error("Error submitting deal:", error);
      setAlert({ message: "Error saving deal", type: "red" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = async (indexToRemove, imageUrl) => {
    setImageError("");
    const isNewImage = typeof imageUrl === 'object' || !imageUrl.startsWith('http');

    if (isNewImage) {
        // For new images that haven't been uploaded to the server yet
        setNewImages(prev => prev.filter((_, i) => i !== indexToRemove - (formData.images.length - newImages.length)));
    } else {
        // For existing images already on the server
        console.log("Adding image to deletedImages:", imageUrl);
        setDeletedImages(prev => [...prev, imageUrl]);
    }
    
    setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== indexToRemove)
    }));
  };

  const handleRemoveVideo = (indexToRemove, videoUrl) => {
    setVideoError("");
    console.log("handleRemoveVideo called with:", { indexToRemove, videoUrl });
    
    const isNewVideo = typeof videoUrl === 'object' || !videoUrl.url || !videoUrl.url.startsWith('http');
    console.log("isNewVideo:", isNewVideo);

    if (isNewVideo) {
        // For new videos that haven't been uploaded to the server yet
        console.log("Removing new video from newVideos array");
        setNewVideos(prev => prev.filter((_, i) => i !== indexToRemove - (formData.videos.length - newVideos.length)));
    } else {
        // For existing videos already on the server
        console.log("Adding video to deletedVideos:", videoUrl.url);
        setDeletedVideos(prev => [...prev, videoUrl.url]);
    }

    setFormData(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== indexToRemove)
    }));
  };

  const confirmDelete = (id, name) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setDeleteId(id);
    setDealName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      await axios.delete(`/deals/${id}`);
      setAlert({ message: "Deal deleted successfully!", type: "green" });
      fetchDeals();
    } catch (error) {
      console.error("Error deleting deal:", error);
      setAlert({ message: "Error deleting deal", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
      setDeleteInProgress(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const [expandedIndices, setExpandedIndices] = useState([]);

  const toggleExpand = (index) => {
    setExpandedIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index],
    );
  };
  
  // Function to handle pagination for view dialog prices
  const handleViewPricesPageChange = (newPage) => {
    setViewPricesPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
  };

  const today = new Date();
  const minStartDate = new Date(today);
  minStartDate.setDate(today.getDate() + 2); // 2 days after today
  const minStartStr = minStartDate.toISOString().split("T")[0];
  const validateDateRange = (price, days) => {
    if (!price.startdate || !price.enddate || !days) return;

    const start = new Date(price.startdate);
    const end = new Date(price.enddate);

    if (end < start) {
      window.alert("End date cannot be before start date.");
      return;
    }

    const actualDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const enteredDays = parseInt(days, 10);

    if (enteredDays !== actualDays) {
      window.alert(
        enteredDays < actualDays
          ? `You entered fewer days (${enteredDays}) than the actual range (${actualDays}).`
          : `You entered more days (${enteredDays}) than the actual range (${actualDays}).`,
      );
    }
  };

  useEffect(() => {
    if (alert.message) {
      const timer = setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

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
    if (formData.images.length + files.length > 10) {
      setImageError("You can upload a maximum of 10 images.");
      return false;
    }
    for (let i = 0; i < files.length; i++) {
      const error = validateImage(files[i]);
      if (error) {
        return error;
      }
    }
    return "";
  };

  // Add a function to toggle price-specific dropdowns
  const togglePriceDropdown = (index, dropdown) => {
    setCustomDropdownOpen(prev => ({
      ...prev,
      priceAirports: {
        ...prev.priceAirports,
        [index]: {
          ...prev.priceAirports[index],
          [dropdown]: !prev.priceAirports[index]?.[dropdown]
        }
      }
    }));
  };

  // Update the handleSearchChange function to update search state
  const handleSearchChange = (dropdown, value, index = null) => {
    if (index !== null) {
      // For price-specific dropdowns
      setDropdownSearch(prev => ({
        ...prev,
        priceAirports: {
          ...prev.priceAirports,
          [index]: {
            ...prev.priceAirports[index],
            [dropdown]: value
          }
        }
      }));
    } else {
      // For regular dropdowns
      setDropdownSearch(prev => ({
        ...prev,
        [dropdown]: value
      }));
    }
  };

  const validateVideo = (file) => {
    const validTypes = ["video/mp4", "video/mpeg", "video/quicktime", "video/x-matroska", "video/x-msvideo"];
    if (!validTypes.includes(file.type)) {
      setVideoError("Invalid file type. Only MP4, MPEG, MOV, MKV, AVI allowed.");
      return false;
    }
    if (file.size > 50 * 1024 * 1024) { // 50MB
      setVideoError("File is too large. Max 50MB.");
      return false;
    }
    return true;
  };

  const validateVideos = (files) => {
    if (formData.videos.length + files.length > 3) {
      setVideoError("You can upload a maximum of 3 videos.");
      return false;
    }
    for (const file of files) {
      if (!validateVideo(file)) return false;
    }
    return true;
  };

  // Function to update available places when destination changes
  const updateAvailablePlaces = (destinationId) => {
    if (!destinationId) {
      setAvailablePlaces([]);
      return;
    }
    
    const selectedDestination = destinations.find(d => d._id === destinationId);
    if (selectedDestination && selectedDestination.places) {
      setAvailablePlaces(selectedDestination.places);
    } else {
      setAvailablePlaces([]);
    }
  };

  // Function to open places selection dialog for a specific destination
  const openPlacesSelectionDialog = (destinationId) => {
    console.log("Opening places selection dialog for destination:", destinationId);
    setSelectedDestinationForPlaces(destinationId);
    console.log("Set selectedDestinationForPlaces to:", destinationId);
    
    // Log which destination we're selecting places for
    const destName = destinations.find(d => d._id === destinationId)?.name || "Unknown";
    console.log(`Selecting places for destination: ${destName} (${destinationId})`);
    
    // Check if this is primary or multicenter destination
    const isPrimary = destinationId === formData.destination;
    console.log(`Is this the primary destination? ${isPrimary ? 'Yes' : 'No'}`);
    
    // Log existing places for this destination
    if (isPrimary) {
      console.log("Current primary destination places:", formData.selectedPlaces);
      
      // Filter places that belong to this destination
      const primaryPlaces = formData.selectedPlaces.filter(place => {
        if (!place.destinationId) return true; // Legacy format, assume primary
        
        const placeDestId = typeof place.destinationId === 'object'
          ? place.destinationId._id.toString()
          : place.destinationId.toString();
          
        return placeDestId === destinationId.toString();
      });
      
      console.log(`Found ${primaryPlaces.length} places for primary destination:`, primaryPlaces);
    } else {
      // Ensure destinationSelectedPlaces has an entry for this destination
      if (!destinationSelectedPlaces[destinationId]) {
        setDestinationSelectedPlaces(prev => ({
          ...prev,
          [destinationId]: []
        }));
      }
      
      console.log("Current multicenter destination places:", destinationSelectedPlaces[destinationId] || []);
    }
    
    fetchPlacesForDestination(destinationId);
    setCustomDropdownOpen(prev => {
      console.log("Setting places dropdown to open");
      return {
        ...prev,
        places: true
      };
    });
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
          Add Deal
        </Button>
      </div>

      {/* Main Screen Cards */}
      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {deals.map((deal) => (
            <Card
              key={deal._id}
              className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Title + Flags & Categories */}
                <div className="flex-1">
                  <Typography
                    variant="h5"
                    color="deep-orange"
                    className="flex items-center justify-start gap-2"
                  >
                    {deal.title}
                  </Typography>

                  <Typography
                    variant="h6"
                    color="deep-orange"
                    className="flex items-center justify-start gap-1"
                  >
                    <MapPinIcon className="mb-1 h-5 w-5" />
                    {deal.destination.name}
                    {/* Show primary destination places */}
                    {deal.selectedPlaces && deal.selectedPlaces.length > 0 && (
                      <span className="text-sm font-normal ml-1">
                        {(() => {
                          // Filter places for primary destination
                          const primaryPlaces = deal.selectedPlaces.filter(place => {
                            if (!place.destinationId) return true; // Legacy format
                            const primaryDestId = deal.destination?._id.toString();
                            const placeDestId = typeof place.destinationId === 'object'
                              ? place.destinationId._id.toString()
                              : place.destinationId.toString();
                            return placeDestId === primaryDestId;
                          });
                          
                          if (primaryPlaces.length > 0) {
                            return `(Places: ${primaryPlaces.map((place, idx) => {
                              // Handle both old and new data structures
                              if (typeof place === 'string') return place;
                              if (place.placeId && typeof place.placeId === 'object' && place.placeId.name) return place.placeId.name;
                              if (place.name) return place.name;
                              if (place.placeId) {
                                // Try to find the place name from the destination's places
                                const placeObj = deal.destination?.places?.find(p => 
                                  p._id.toString() === place.placeId.toString());
                                return placeObj ? placeObj.name : `Place ${idx+1}`;
                              }
                              return `Place ${idx+1}`;
                            }).join(', ')})`;
                          }
                          return '';
                        })()}
                      </span>
                    )}
                    {deal.destinations && deal.destinations.length > 0 && (
                      <span className="text-sm font-normal">
                        , {deal.destinations.map((dest, idx) => {
                          const destId = typeof dest === 'object' ? dest._id : dest;
                          const destName = typeof dest === 'object' ? dest.name : 
                                         destinations.find(d => d._id === destId)?.name || destId;
                          
                          // Count places for this destination
                          const destPlaces = deal.selectedPlaces ? deal.selectedPlaces.filter(place => {
                            if (place.destinationId) {
                              const placeDestId = typeof place.destinationId === 'object' 
                                ? place.destinationId._id.toString() 
                                : place.destinationId.toString();
                              return placeDestId === destId.toString();
                            }
                            return false;
                          }) : [];
                          
                          return `${destName}${destPlaces.length > 0 ? ` (${destPlaces.length} places)` : ''}${idx < deal.destinations.length - 1 ? ', ' : ''}`;
                        })}
                      </span>
                    )}
                  </Typography>

                  <Typography
                    variant="sm"
                    color="deep-orange"
                    className="flex items-center justify-start gap-2 font-normal"
                  >
                    <StopCircleIcon className="mb-1 ml-1 h-3 w-3" />
                    {deal.boardBasis.name}
                  </Typography>

                  {/* Flags */}
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        color="orange"
                        checked={deal.isTopDeal}
                        disabled
                      />
                      <Typography variant="small">Top Deal</Typography>
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox color="red" checked={deal.isHotdeal} disabled />
                      <Typography variant="small">Hot Deal</Typography>
                    </div>
                    <div className="flex items-center gap-1">
                      <Checkbox
                        color="green"
                        checked={deal.isFeatured}
                        disabled
                      />
                      <Typography variant="small">Featured</Typography>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mt-2">
                    <Typography
                      variant="text"
                      className="font-bold text-deep-orange-300"
                    >
                      Categories:
                    </Typography>
                    {Array.isArray(deal.holidaycategories) &&
                    deal.holidaycategories.length > 0 ? (
                      <ul className="list-disc pl-6 text-black">
                        {deal.holidaycategories.map((catItem, idx) => {
                          const catId =
                            typeof catItem === "object" ? catItem._id : catItem;
                          const catObj = holidaycategories.find(
                            (h) => h._id === catId,
                          );
                          const name = catObj ? catObj.name : catId;
                          return <li key={idx}>{name}</li>;
                        })}
                      </ul>
                    ) : (
                      <Typography variant="paragraph" className="text-black">
                        No categories selected.
                      </Typography>
                    )}
                  </div>
                </div>

                {/* Action buttons (View/Edit/Delete) */}
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
                      onClick={() => handleOpenViewDialog(deal)}
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
                      onClick={() => handleOpenDialog(deal)}
                      className="p-2"
                      disabled={buttonDisabled}
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
                      onClick={() => confirmDelete(deal._id, deal.title)}
                      className="p-2"
                      disabled={buttonDisabled}
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

      {/* Add/Edit Deal Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="lg">
        <DialogHeader className="flex items-center justify-between gap-2">
          {currentDeal ? "Edit Deal" : "Add Deal"}
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
              label="Deal Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
            <Input
              label="Deal Tag"
              value={formData.tag}
              onChange={(e) =>
                setFormData({ ...formData, tag: e.target.value })
              }
            />
            <Input
              label="Low Deposite"
              value={formData.LowDeposite}
              onChange={(e) =>
                setFormData({ ...formData, LowDeposite: e.target.value })
              }
            />
            <Typography variant="h6">Available Countries</Typography>
            <div className="grid gap-2">
              {["Canada", "USA", "UK"].map((country) => (
                <label
                  key={country}
                  className="flex cursor-pointer items-center"
                >
                  <Checkbox
                    ripple={false}
                    color="blue"
                    containerProps={{ className: "p-0" }}
                    className="hover:before:content-none"
                    checked={formData.availableCountries.includes(country)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      const updatedCountries = isChecked
                        ? [...formData.availableCountries, country]
                        : formData.availableCountries.filter(
                            (c) => c !== country
                          );
                      setFormData({
                        ...formData,
                        availableCountries: updatedCountries,
                      });
                    }}
                  />
                  <span>{country}</span>
                </label>
              ))}
            </div>

            {/* Single destination support (legacy) */}
            <div className="relative">
              <Typography variant="h6">Primary Destination</Typography>
              <button
                type="button"
                className="w-full flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => setCustomDropdownOpen(prev => ({
                  ...prev,
                  primaryDestination: !prev.primaryDestination
                }))}
              >
                <span className="text-left">
                  {formData.destination 
                    ? destinations.find(d => d._id === formData.destination)?.name || "Select Primary Destination"
                    : "Select Primary Destination"}
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {customDropdownOpen.primaryDestination && (
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
                        value={dropdownSearch.primaryDestination}
                        onChange={(e) => handleSearchChange('primaryDestination', e.target.value)}
                      />
                    </div>
                    
                    {/* Options list with scroll */}
                    <div className="overflow-y-auto max-h-48">
                      {destinations
                        .filter(destination => 
                          destination.name.toLowerCase().includes(dropdownSearch.primaryDestination.toLowerCase())
                        )
                        .map((destination) => (
                          <div 
                            key={destination._id}
                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                            onClick={() => {
                              // If this destination is in the multicenter list, remove it
                              const updatedDestinations = formData.destinations.filter(
                                id => id.toString() !== destination._id.toString()
                              );
                              
                              // Update form data
                              setFormData({ 
                                ...formData, 
                                destination: destination._id,
                                destinations: updatedDestinations,
                                selectedPlaces: [] // Reset selected places when destination changes
                              });
                              
                              // Update available places for the selected destination
                              fetchPlacesForDestination(destination._id);
                              
                              // Close dropdown
                              setCustomDropdownOpen(prev => ({...prev, primaryDestination: false}));
                            }}
                          >
                            {destination.name}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div 
                    className="fixed inset-0 z-[10000]" 
                    onClick={() => setCustomDropdownOpen(prev => ({...prev, primaryDestination: false}))}
                  ></div>
                </>
              )}
            </div>
            
            {/* Button to select places for primary destination */}
            {formData.destination && (
              <div className="mt-2">
                <button
                  type="button"
                  className="w-full flex items-center justify-between bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
                  onClick={() => openPlacesSelectionDialog(formData.destination)}
                >
                  <span className="text-left">
                    {formData.selectedPlaces.filter(place => {
                      if (!place.destinationId) return false;
                      const placeDestId = typeof place.destinationId === 'object' 
                        ? place.destinationId._id.toString() 
                        : place.destinationId.toString();
                      return placeDestId === formData.destination.toString();
                    }).length > 0
                      ? `${formData.selectedPlaces.filter(place => {
                          if (!place.destinationId) return false;
                          const placeDestId = typeof place.destinationId === 'object' 
                            ? place.destinationId._id.toString() 
                            : place.destinationId.toString();
                          return placeDestId === formData.destination.toString();
                        }).length} place(s) selected`
                      : "Select Places for Primary Destination"}
                  </span>
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>
            )}

            {/* Places dropdown for the selected destination */}
            {customDropdownOpen.places && selectedDestinationForPlaces && (
              <div className="fixed inset-0 z-[200000] flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-4">
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6" color="gray">
                      Places in {destinations.find(d => d._id === selectedDestinationForPlaces)?.name || "Destination"}
                      {(() => {
                        // Count selected places for this destination
                        let selectedCount = 0;
                        
                        if (selectedDestinationForPlaces === formData.destination) {
                          // Count primary destination places
                          selectedCount = formData.selectedPlaces.filter(place => {
                            if (!place.destinationId) return true; // Legacy format
                            const placeDestId = typeof place.destinationId === 'object'
                              ? place.destinationId._id.toString()
                              : place.destinationId.toString();
                            return placeDestId === selectedDestinationForPlaces.toString();
                          }).length;
                        } else {
                          // Count multicenter destination places
                          selectedCount = (destinationSelectedPlaces[selectedDestinationForPlaces] || []).length;
                        }
                        
                        if (selectedCount > 0) {
                          return (
                            <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              {selectedCount} selected
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </Typography>
                    <div className="flex items-center">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => {
                          // Test function to log the current state
                          console.log("Current selected places state:");
                          console.log("Primary destination places:", formData.selectedPlaces);
                          console.log("Multicenter places:", destinationSelectedPlaces);
                          console.log("Current destination being edited:", selectedDestinationForPlaces);
                          
                          // Test if places are selected for this destination
                          if (availablePlaces.length > 0) {
                            if (selectedDestinationForPlaces === formData.destination) {
                              // Check primary destination places
                              const primaryPlaces = formData.selectedPlaces.filter(place => {
                                if (!place.destinationId) return true; // Legacy format
                                
                                const placeDestId = typeof place.destinationId === 'object'
                                  ? place.destinationId._id.toString()
                                  : place.destinationId.toString();
                                  
                                return placeDestId === selectedDestinationForPlaces.toString();
                              });
                              
                              console.log(`Found ${primaryPlaces.length} places for primary destination:`, primaryPlaces);
                              
                              // Check each available place
                              availablePlaces.forEach(place => {
                                const isSelected = primaryPlaces.some(item => {
                                  if (item && item.placeId) {
                                    const placeIdStr = typeof item.placeId === 'object' ? 
                                      item.placeId._id.toString() : item.placeId.toString();
                                    return placeIdStr === place._id.toString();
                                  }
                                  return false;
                                });
                                
                                console.log(`Place ${place.name} (${place._id}) selected: ${isSelected}`);
                              });
                            } else {
                              // Check multicenter destination places
                              const selectedPlaces = destinationSelectedPlaces[selectedDestinationForPlaces] || [];
                              console.log(`Found ${selectedPlaces.length} places for multicenter destination:`, selectedPlaces);
                              
                              // Check each available place
                              availablePlaces.forEach(place => {
                                const isSelected = selectedPlaces.some(item => {
                                  if (item && item.placeId) {
                                    const placeIdStr = typeof item.placeId === 'object' ? 
                                      item.placeId._id.toString() : item.placeId.toString();
                                    return placeIdStr === place._id.toString();
                                  }
                                  return false;
                                });
                                
                                console.log(`Place ${place.name} (${place._id}) selected: ${isSelected}`);
                              });
                            }
                            
                            // Force update the state to trigger a re-render
                            if (selectedDestinationForPlaces === formData.destination) {
                              setFormData({...formData});
                            } else {
                              setDestinationSelectedPlaces({...destinationSelectedPlaces});
                            }
                          }
                        }}
                      >
                        <span className="text-xs">Test</span>
                      </button>
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-700 mr-2"
                        onClick={() => {
                          // Debug function to manually check and fix places
                          console.log("Running debug function for places selection");
                          
                          if (availablePlaces.length > 0) {
                            // Check if we have any places already selected
                            if (selectedDestinationForPlaces === formData.destination) {
                              // For primary destination
                              const existingPlaces = formData.selectedPlaces.filter(place => {
                                if (!place.destinationId) return true; // Legacy format
                                
                                const placeDestId = typeof place.destinationId === 'object'
                                  ? place.destinationId._id.toString()
                                  : place.destinationId.toString();
                                  
                                return placeDestId === selectedDestinationForPlaces.toString();
                              });
                              
                              console.log(`Found ${existingPlaces.length} existing places for primary destination`);
                              
                              // If no places are selected, select the first one
                              if (existingPlaces.length === 0) {
                                const firstPlace = availablePlaces[0];
                                console.log("Manually selecting first place for primary destination:", firstPlace);
                                
                                setFormData(prev => ({
                                  ...prev,
                                  selectedPlaces: [...prev.selectedPlaces, {
                                    placeId: firstPlace._id,
                                    destinationId: selectedDestinationForPlaces
                                  }]
                                }));
                              }
                            } else {
                              // For multicenter destinations
                              const existingPlaces = destinationSelectedPlaces[selectedDestinationForPlaces] || [];
                              console.log(`Found ${existingPlaces.length} existing places for multicenter destination`);
                              
                              // If no places are selected, select the first one
                              if (existingPlaces.length === 0) {
                                const firstPlace = availablePlaces[0];
                                console.log("Manually selecting first place for multicenter destination:", firstPlace);
                                
                                setDestinationSelectedPlaces(prev => ({
                                  ...prev,
                                  [selectedDestinationForPlaces]: [...(prev[selectedDestinationForPlaces] || []), {
                                    placeId: firstPlace._id,
                                    destinationId: selectedDestinationForPlaces
                                  }]
                                }));
                              }
                            }
                          }
                        }}
                      >
                        <span className="text-xs">Debug</span>
                      </button>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setCustomDropdownOpen(prev => ({ ...prev, places: false }))}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Search input */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        className="flex-1 p-2 border border-gray-300 rounded-md"
                        placeholder="Search places..."
                        value={dropdownSearch.places}
                        onChange={(e) => handleSearchChange('places', e.target.value)}
                      />
                      <button
                        type="button"
                        className="ml-2 bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 text-xs"
                        onClick={() => {
                          // Get all visible places after filtering
                          const visiblePlaces = availablePlaces
                            .filter(place => place.name.toLowerCase().includes(dropdownSearch.places.toLowerCase()));
                          
                          console.log(`Selecting all ${visiblePlaces.length} visible places`);
                          
                          if (selectedDestinationForPlaces === formData.destination) {
                            // For primary destination
                            // Combine existing selections with new ones, avoiding duplicates
                            const existingIds = formData.selectedPlaces.map(item => {
                              if (item && item.placeId) {
                                return typeof item.placeId === 'object' ? 
                                  item.placeId._id.toString() : item.placeId.toString();
                              }
                              return typeof item === 'object' ? item._id.toString() : item.toString();
                            });
                            
                            const newPlaces = [
                              ...formData.selectedPlaces,
                              ...visiblePlaces
                                .filter(place => !existingIds.includes(place._id.toString()))
                                .map(place => ({
                                  placeId: place._id,
                                  destinationId: selectedDestinationForPlaces
                                }))
                            ];
                            
                            console.log("Updated primary places after Select All:", newPlaces);
                            setFormData(prev => ({
                              ...prev,
                              selectedPlaces: newPlaces
                            }));
                          } else {
                            // For multicenter destinations
                            const currentPlaces = destinationSelectedPlaces[selectedDestinationForPlaces] || [];
                            const existingIds = currentPlaces.map(item => {
                              if (item && item.placeId) {
                                return typeof item.placeId === 'object' ? 
                                  item.placeId._id.toString() : item.placeId.toString();
                              }
                              return typeof item === 'object' ? item._id.toString() : item.toString();
                            });
                            
                            const newPlaces = [
                              ...currentPlaces,
                              ...visiblePlaces
                                .filter(place => !existingIds.includes(place._id.toString()))
                                .map(place => ({
                                  placeId: place._id,
                                  destinationId: selectedDestinationForPlaces
                                }))
                            ];
                            
                            console.log("Updated multicenter places after Select All:", newPlaces);
                            setDestinationSelectedPlaces(prev => ({
                              ...prev,
                              [selectedDestinationForPlaces]: newPlaces
                            }));
                          }
                        }}
                      >
                        Select All ({availablePlaces.filter(place => place.name.toLowerCase().includes(dropdownSearch.places.toLowerCase())).length})
                      </button>
                      <button
                        type="button"
                        className="ml-2 bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 text-xs"
                        onClick={() => {
                          // Clear all selected places for this destination
                          console.log("Clearing all places for destination:", selectedDestinationForPlaces);
                          
                          if (selectedDestinationForPlaces === formData.destination) {
                            // For primary destination
                            console.log("Clearing primary destination places");
                            setFormData(prev => ({
                              ...prev,
                              selectedPlaces: []
                            }));
                          } else {
                            // For multicenter destinations
                            console.log("Clearing multicenter destination places");
                            setDestinationSelectedPlaces(prev => ({
                              ...prev,
                              [selectedDestinationForPlaces]: []
                            }));
                          }
                        }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  
                  {/* Show selected places */}
                  {((selectedDestinationForPlaces === formData.destination && formData.selectedPlaces.length > 0) ||
                    (selectedDestinationForPlaces !== formData.destination && 
                     (destinationSelectedPlaces[selectedDestinationForPlaces]?.length > 0))) && (
                    <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                      <div className="font-semibold">Selected Places:</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedDestinationForPlaces === formData.destination 
                          ? formData.selectedPlaces
                              .filter(placeItem => {
                                // Only show places for primary destination
                                if (!placeItem.destinationId) return true;
                                const placeDestId = typeof placeItem.destinationId === 'object'
                                  ? placeItem.destinationId._id.toString()
                                  : placeItem.destinationId.toString();
                                return placeDestId === selectedDestinationForPlaces.toString();
                              })
                              .map((placeItem, idx) => {
                                const placeId = placeItem.placeId || placeItem;
                                const placeIdStr = typeof placeId === 'object' ? placeId._id : placeId;
                                
                                const place = availablePlaces.find(p => p._id.toString() === placeIdStr.toString());
                                const placeName = place ? place.name : 
                                  (typeof placeItem === 'object' && placeItem.name) ? placeItem.name :
                                  `Place ${idx+1}`;
                                
                                return (
                                  <span key={`primary-${idx}`} className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                    {placeName}
                                  </span>
                                );
                              })
                          : (destinationSelectedPlaces[selectedDestinationForPlaces] || [])
                              .map((placeItem, idx) => {
                                const placeId = placeItem.placeId || placeItem;
                                const placeIdStr = typeof placeId === 'object' ? placeId._id : placeId;
                                
                                const place = availablePlaces.find(p => p._id.toString() === placeIdStr.toString());
                                const placeName = place ? place.name : 
                                  (typeof placeItem === 'object' && placeItem.name) ? placeItem.name :
                                  `Place ${idx+1}`;
                                
                                return (
                                  <span key={`multicenter-${idx}`} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {placeName}
                                  </span>
                                );
                              })
                        }
                      </div>
                    </div>
                  )}

                  {/* Places list */}
                  <div className="overflow-y-auto max-h-80">
                    {availablePlaces.length > 0 ? (
                      availablePlaces
                        .filter(place => place.name.toLowerCase().includes(dropdownSearch.places.toLowerCase()))
                        .map((place) => {
                          let isSelected = false;
                          
                          if (selectedDestinationForPlaces === formData.destination) {
                            // For primary destination
                            isSelected = formData.selectedPlaces.some(item => {
                              if (!item.destinationId) return false; // Skip if no destinationId
                              if (item && item.placeId) {
                                const placeIdStr = typeof item.placeId === 'object' ? 
                                  item.placeId._id.toString() : item.placeId.toString();
                                const placeDestId = typeof item.destinationId === 'object' ?
                                  item.destinationId._id.toString() : item.destinationId.toString();
                                return placeIdStr === place._id.toString() && 
                                       placeDestId === selectedDestinationForPlaces.toString();
                              }
                              return false;
                            });
                          } else {
                            // For multicenter destinations
                            const selectedPlaces = destinationSelectedPlaces[selectedDestinationForPlaces] || [];
                            isSelected = selectedPlaces.some(item => {
                              if (item && item.placeId) {
                                const placeIdStr = typeof item.placeId === 'object' ? 
                                  item.placeId._id.toString() : item.placeId.toString();
                                const placeDestId = typeof item.destinationId === 'object' ?
                                  item.destinationId._id.toString() : item.destinationId.toString();
                                return placeIdStr === place._id.toString() && 
                                       placeDestId === selectedDestinationForPlaces.toString();
                              }
                              return false;
                            });
                          }

                          return (
                            <div key={`place-${place._id}`} className="flex items-center p-2 hover:bg-gray-50">
                              <input
                                type="checkbox"
                                id={`place-${place._id}`}
                                checked={isSelected}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  console.log(`Checkbox for ${place.name} changed to: ${isChecked}`);
                                  
                                  if (selectedDestinationForPlaces === formData.destination) {
                                    // For primary destination, update formData.selectedPlaces
                                    if (isChecked) {
                                      // Add the place with proper format
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedPlaces: [...prev.selectedPlaces, {
                                          placeId: place._id,
                                          destinationId: selectedDestinationForPlaces
                                        }]
                                      }));
                                    } else {
                                      // Remove the place
                                      setFormData(prev => ({
                                        ...prev,
                                        selectedPlaces: prev.selectedPlaces.filter(item => {
                                          if (item && item.placeId) {
                                            const placeIdStr = typeof item.placeId === 'object' ? 
                                              item.placeId._id.toString() : item.placeId.toString();
                                            return placeIdStr !== place._id.toString();
                                          }
                                          return true;
                                        })
                                      }));
                                    }
                                  } else {
                                    // For multicenter destinations
                                    const currentPlaces = destinationSelectedPlaces[selectedDestinationForPlaces] || [];
                                    
                                    if (isChecked) {
                                      // Add the place with proper format
                                      setDestinationSelectedPlaces(prev => ({
                                        ...prev,
                                        [selectedDestinationForPlaces]: [...currentPlaces, {
                                          placeId: place._id,
                                          destinationId: selectedDestinationForPlaces
                                        }]
                                      }));
                                    } else {
                                      // Remove the place
                                      setDestinationSelectedPlaces(prev => ({
                                        ...prev,
                                        [selectedDestinationForPlaces]: currentPlaces.filter(item => {
                                          if (item && item.placeId) {
                                            const placeIdStr = typeof item.placeId === 'object' ? 
                                              item.placeId._id.toString() : item.placeId.toString();
                                            return placeIdStr !== place._id.toString();
                                          }
                                          return true;
                                        })
                                      }));
                                    }
                                  }
                                }}
                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                              />
                              <label 
                                htmlFor={`place-${place._id}`}
                                className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                              >
                                {place.name}
                              </label>
                            </div>
                          );
                        })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        No places found for this destination
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      onClick={() => setCustomDropdownOpen(prev => ({ ...prev, places: false }))}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Multiple destinations support */}
            <div className="relative">
            <Typography variant="h6" color="gray">Multicenter</Typography>
              <button
                type="button"
                className="w-full flex items-center justify-between bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => setCustomDropdownOpen(prev => ({
                  ...prev,
                  destinations: !prev.destinations
                }))}
              >
                <span className="text-left">
                  {formData.destinations.length > 0
                    ? `${formData.destinations.length} destination(s) selected`
                    : "Add Multiple Destinations"}
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {customDropdownOpen.destinations && (
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
                        value={dropdownSearch.destinations}
                        onChange={(e) => handleSearchChange('destinations', e.target.value)}
                      />
                    </div>
                    
                    {/* Options list with scroll */}
                    <div className="overflow-y-auto max-h-48">
                {destinations
                        .filter(destination => 
                          // Filter out the primary destination
                          destination._id !== formData.destination &&
                          // Filter by search text
                          destination.name.toLowerCase().includes(dropdownSearch.destinations.toLowerCase())
                        )
                  .map((destination) => (
                          <div 
                    key={destination._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              id={`destination-${destination._id}`}
                      checked={formData.destinations.some(id => 
                        id === destination._id || id.toString() === destination._id.toString()
                      )}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedDestinations = isChecked
                          ? [...formData.destinations, destination._id]
                          : formData.destinations.filter(
                              id => id.toString() !== destination._id.toString()
                            );
                        setFormData({
                          ...formData,
                          destinations: updatedDestinations,
                        });
                              }}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                            />
                            <label 
                              htmlFor={`destination-${destination._id}`}
                              className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {destination.name}
                            </label>
                            
                            {/* Button to select places for this destination */}
                            {formData.destinations.some(id => 
                              id === destination._id || id.toString() === destination._id.toString()
                            ) && (
                              <button
                                type="button"
                                className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent checkbox toggle
                                  openPlacesSelectionDialog(destination._id);
                                }}
                              >
                                Places
                                {destinationSelectedPlaces[destination._id]?.length > 0 && (
                                  <span className="ml-1 bg-white text-green-500 rounded-full px-1">
                                    {destinationSelectedPlaces[destination._id].length}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                  <div 
                    className="fixed inset-0 z-[10000]" 
                    onClick={() => setCustomDropdownOpen(prev => ({...prev, destinations: false}))}
                  ></div>
                </>
              )}
            </div>

            <div className="relative">
            <Typography variant="h6">Select Holidays Categories</Typography>
              <button
                type="button"
                className="w-full flex items-center justify-between bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => setCustomDropdownOpen(prev => ({
                  ...prev,
                  holidayCategories: !prev.holidayCategories
                }))}
              >
                <span className="text-left">
                  {formData.holidaycategories.length > 0
                    ? `${formData.holidaycategories.length} categorie(s) selected`
                    : "Select Holidays Categories"}
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {customDropdownOpen.holidayCategories && (
                <>
                  <div 
                    className="absolute z-[100000] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col"
                  >
                    {/* Search input */}
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Search categories..."
                        value={dropdownSearch.holidayCategories}
                        onChange={(e) => handleSearchChange('holidayCategories', e.target.value)}
                      />
                    </div>
                    
                    {/* Options list with scroll */}
                    <div className="overflow-y-auto max-h-48">
                      {holidaycategories
                        .filter(holidaycategorie => 
                          holidaycategorie.name.toLowerCase().includes(dropdownSearch.holidayCategories.toLowerCase())
                        )
                        .map((holidaycategorie) => (
                          <div 
                    key={holidaycategorie._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              id={`holiday-${holidaycategorie._id}`}
                              checked={formData.holidaycategories.includes(holidaycategorie._id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedHolidaysCategories = isChecked
                                  ? [...formData.holidaycategories, holidaycategorie._id]
                          : formData.holidaycategories.filter(
                                      (id) => id !== holidaycategorie._id
                            );
                        setFormData({
                          ...formData,
                          holidaycategories: updatedHolidaysCategories,
                        });
                      }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label 
                              htmlFor={`holiday-${holidaycategorie._id}`}
                              className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {holidaycategorie.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div 
                    className="fixed inset-0 z-[10000]" 
                    onClick={() => setCustomDropdownOpen(prev => ({...prev, holidayCategories: false}))}
                  ></div>
                </>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input
                label="Number of Nights"
                type="number"
                // value={formData.days}
                value={formData.days === 0 ? "" : formData.days}
                onChange={(e) =>
                  setFormData({ ...formData, days: Number(e.target.value) })
                }
                required
              />

              <Select
                label="Board Basis"
                value={formData.boardBasis}
                onChange={(value) =>
                  setFormData({ ...formData, boardBasis: value })
                }
                required
              >
                {boardBasis.map((boardBasis) => (
                  <Option key={boardBasis._id} value={boardBasis._id}>
                    {boardBasis.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="relative">
            <Typography variant="h6">Select Hotels</Typography>
              <button
                type="button"
                className="w-full flex items-center justify-between bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 px-4 rounded"
                onClick={() => setCustomDropdownOpen(prev => ({
                  ...prev,
                  hotels: !prev.hotels
                }))}
              >
                <span className="text-left">
                  {formData.hotels.length > 0
                    ? `${formData.hotels.length} hotel(s) selected`
                    : "Select Hotels"}
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {customDropdownOpen.hotels && (
                <>
                  <div 
                    className="absolute z-[100000] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col"
                  >
                    {/* Search input */}
                    <div className="p-2 border-b sticky top-0 bg-white">
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Search hotels..."
                        value={dropdownSearch.hotels}
                        onChange={(e) => handleSearchChange('hotels', e.target.value)}
                      />
                    </div>
                    
                    {/* Options list with scroll */}
                    <div className="overflow-y-auto max-h-48">
                      {hotels
                        .filter(hotel => 
                          hotel.name.toLowerCase().includes(dropdownSearch.hotels.toLowerCase())
                        )
                        .map((hotel) => (
                          <div 
                    key={hotel._id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              id={`hotel-${hotel._id}`}
                      checked={formData.hotels.includes(hotel._id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        const updatedHotels = isChecked
                          ? [...formData.hotels, hotel._id]
                          : formData.hotels.filter((id) => id !== hotel._id);
                        setFormData({ ...formData, hotels: updatedHotels });
                      }}
                              className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                            />
                            <label 
                              htmlFor={`hotel-${hotel._id}`}
                              className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                            >
                              {hotel.name}
                            </label>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div 
                    className="fixed inset-0 z-[10000]" 
                    onClick={() => setCustomDropdownOpen(prev => ({...prev, hotels: false}))}
                  ></div>
                </>
              )}
            </div>

            {/* Price Fields */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Typography variant="h6" className="text-amber-600">Price Details</Typography>
                <div className="flex items-center gap-2">
                  <select 
                    className="border border-amber-400 rounded px-2 py-1 text-sm bg-amber-50"
                    value={pricesPagination.itemsPerPage}
                    onChange={(e) => setPricesPagination(prev => ({ 
                      ...prev, 
                      itemsPerPage: parseInt(e.target.value),
                      currentPage: 1 // Reset to first page when changing items per page
                    }))}
                  >
                    <option value={10000}>None (Show All)</option>
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <button
                    type="button"
                    className="bg-amber-500 hover:bg-amber-600 text-white text-sm px-3 py-1 rounded"
                    onClick={() => {
                      const updatedPrices = [...formData.prices, {
                        country: "",
                        priceswitch: false,
                        airport: [],
                        hotel: "",
                        startdate: "",
                        enddate: "",
                        price: 0,
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
                      }];
                      setFormData({ ...formData, prices: updatedPrices });
                      // Expand the newly added price
                      setExpandedPrices(prev => ({
                        ...prev,
                        [updatedPrices.length - 1]: true
                      }));
                      // Go to the page containing the new price
                      const newPage = Math.ceil(updatedPrices.length / pricesPagination.itemsPerPage);
                      setPricesPagination(prev => ({
                        ...prev,
                        currentPage: newPage
                      }));
                    }}
                  >
                    Add Price
                  </button>
                </div>
              </div>
              
              {/* Show pagination if there are more prices than items per page */}
              {formData.prices.length > pricesPagination.itemsPerPage && (
                <div className="flex justify-center mb-4">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded disabled:opacity-50"
                      disabled={pricesPagination.currentPage === 1}
                      onClick={() => handlePricesPageChange(pricesPagination.currentPage - 1)}
                    >
                      &laquo;
                    </button>
                    
                    {Array.from({ length: Math.ceil(formData.prices.length / pricesPagination.itemsPerPage) }, (_, i) => i + 1)
                      .filter(page => {
                        const currentPage = pricesPagination.currentPage;
                        const totalPages = Math.ceil(formData.prices.length / pricesPagination.itemsPerPage);
                        // Always show first and last page
                        if (page === 1 || page === totalPages) return true;
                        // Show pages around current page
                        if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                        return false;
                      })
                      .map((page, i, filteredPages) => (
                        <React.Fragment key={page}>
                          {i > 0 && filteredPages[i - 1] + 1 !== page && (
                            <span className="px-3 py-1">...</span>
                          )}
                          <button
                            type="button"
                            className={`px-3 py-1 rounded ${
                              page === pricesPagination.currentPage
                                ? "bg-amber-500 text-white"
                                : "bg-amber-50 hover:bg-amber-100"
                            }`}
                            onClick={() => handlePricesPageChange(page)}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      ))
                    }
                    
                    <button
                      type="button"
                      className="bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded disabled:opacity-50"
                      disabled={pricesPagination.currentPage === Math.ceil(formData.prices.length / pricesPagination.itemsPerPage)}
                      onClick={() => handlePricesPageChange(pricesPagination.currentPage + 1)}
                    >
                      &raquo;
                    </button>
                  </div>
                </div>
              )}
              
              {/* Display prices for the current page */}
              {formData.prices
                .slice(
                  (pricesPagination.currentPage - 1) * pricesPagination.itemsPerPage,
                  pricesPagination.currentPage * pricesPagination.itemsPerPage
                )
                .map((price, sliceIndex) => {
                  // Calculate the actual index in the formData.prices array
                  const index = (pricesPagination.currentPage - 1) * pricesPagination.itemsPerPage + sliceIndex;
                  
                  return (
                    <div key={index} className="mb-4 rounded border">
                      {/* Price header with collapse/expand toggle */}
                      <div 
                        className="p-3 bg-amber-50 flex justify-between items-center cursor-pointer"
                        onClick={() => togglePriceExpand(index)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            Price #{index + 1}: 
                            {price.country && <span className="ml-2">{price.country}</span>}
                            {price.airport?.length > 0 && (
                              <span className="ml-2">
                                ({price.airport.length} airport{price.airport.length !== 1 ? 's' : ''})
                              </span>
                            )}
                            {price.startdate && (
                              <span className="ml-2">
                                {new Date(price.startdate).toLocaleDateString()}
                              </span>
                            )}
                            {price.price > 0 && (
                              <span className="ml-2 font-bold">
                                ${price.price}
                              </span>
                            )}
                          </div>
                          {price.priceswitch && (
                            <span className="bg-black text-white text-xs px-2 py-1 rounded">
                              Off in website
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            className="text-red-600 hover:text-red-800"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent toggle when clicking delete
                              if (window.confirm(`Are you sure you want to remove Price #${index + 1}?`)) {
                                const updatedPrices = formData.prices.filter((_, i) => i !== index);
                                setFormData({ ...formData, prices: updatedPrices });
                                
                                // Update pagination if needed
                                const totalPages = Math.ceil(updatedPrices.length / pricesPagination.itemsPerPage);
                                if (pricesPagination.currentPage > totalPages && totalPages > 0) {
                                  setPricesPagination(prev => ({
                                    ...prev,
                                    currentPage: totalPages
                                  }));
                                }
                              }
                            }}
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                          <svg
                            className={`h-5 w-5 transition-transform ${expandedPrices[index] ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Collapsible price content */}
                      {expandedPrices[index] && (
                        <div className="p-3 space-y-2">
                          {/* Price Switch */}
                          <div className="flex items-center">
                            <Switch
                              id={`priceswitch-${index}`}
                              ripple={false}
                              checked={price.priceswitch}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].priceswitch = e.target.checked;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                              className="h-full w-full checked:bg-black"
                              containerProps={{
                                className: "w-11 h-6",
                              }}
                              circleProps={{
                                className: "before:hidden left-0.5 border-none",
                              }}
                            />
                            <label className="ml-2" htmlFor={`priceswitch-${index}`}>
                              Price Switch (turn switch to black for off in website)
                            </label>
                          </div>

                          <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-3">
                            <Select
                              label="Country"
                              value={price.country}
                              onChange={(value) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].country = value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                              required
                            >
                              {["Canada", "USA", "UK"].map((country) => (
                                <Option key={country} value={country}>
                                  {country}
                                </Option>
                              ))}
                            </Select>

                            <div className="relative">
                              <button
                                type="button"
                                className="w-full flex items-center justify-between bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded"
                                onClick={() => togglePriceDropdown(index, 'airports')}
                              >
                                <span className="text-left">
                                  {formData.prices[index].airport.length > 0
                                    ? `${formData.prices[index].airport.length} airport(s) selected`
                                    : "Select Airports"}
                                </span>
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                              </button>
                              
                              {customDropdownOpen.priceAirports[index]?.airports && (
                                <>
                                  <div 
                                    className="absolute z-[100000] mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden flex flex-col"
                                  >
                                    {/* Search input */}
                                    <div className="p-2 border-b sticky top-0 bg-white">
                                      <input
                                        type="text"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        placeholder="Search airports..."
                                        value={dropdownSearch.priceAirports[index]?.airports || ''}
                                        onChange={(e) => handleSearchChange('airports', e.target.value, index)}
                                      />
                                    </div>
                                    
                                    {/* Options list with scroll */}
                                    <div className="overflow-y-auto max-h-48">
                                      {airports
                                        .filter(airport => {
                                          const searchText = dropdownSearch.priceAirports[index]?.airports || '';
                                          return airport.name.toLowerCase().includes(searchText.toLowerCase()) ||
                                                 airport.code.toLowerCase().includes(searchText.toLowerCase());
                                        })
                                        .map((airport) => (
                                          <div 
                                            key={airport._id}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-100 cursor-pointer"
                                          >
                                            <input
                                              type="checkbox"
                                              id={`airport-${index}-${airport._id}`}
                                              checked={price.airport?.includes(airport._id)}
                                              onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                const updatedPrices = [...formData.prices];
                                                const updatedAirports = isChecked
                                                  ? [
                                                      ...(updatedPrices[index].airport || []),
                                                      airport._id,
                                                    ]
                                                  : (updatedPrices[index].airport || []).filter(
                                                      (id) => id !== airport._id,
                                                    );

                                                updatedPrices[index] = {
                                                  ...updatedPrices[index],
                                                  airport: updatedAirports,
                                                };

                                                setFormData({
                                                  ...formData,
                                                  prices: updatedPrices,
                                                });
                                              }}
                                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                            />
                                            <label 
                                              htmlFor={`airport-${index}-${airport._id}`}
                                              className="ml-2 text-sm text-gray-700 cursor-pointer flex-1"
                                            >
                                              {airport.name} ({airport.code})
                                            </label>
                                          </div>
                                        ))}
                                    </div>
                                  </div>
                                  <div 
                                    className="fixed inset-0 z-[10000]" 
                                    onClick={() => togglePriceDropdown(index, 'airports')}
                                  ></div>
                                </>
                              )}
                            </div>

                            <Select
                              label="Hotel"
                              value={
                                price.hotel && typeof price.hotel === "object"
                                  ? price.hotel._id
                                  : price.hotel
                              }
                              onChange={(value) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].hotel = value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                              required
                            >
                              {hotels.map((hotel) => (
                                <Option key={hotel._id} value={hotel._id}>
                                  {hotel.name}
                                </Option>
                              ))}
                            </Select>
                          </div>

                          <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-3">
                            <Input
                              label="Start Date"
                              type="date"
                              min={minStartStr}
                              value={price.startdate}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].startdate = e.target.value;
                                if (
                                  updatedPrices[index].enddate &&
                                  new Date(updatedPrices[index].enddate) <
                                    new Date(e.target.value)
                                ) {
                                  updatedPrices[index].enddate = e.target.value;
                                }
                                setFormData({ ...formData, prices: updatedPrices });
                                validateDateRange(updatedPrices[index], formData.days);
                              }}
                              required
                            />
                            <Input
                              label="End Date"
                              type="date"
                              min={price.startdate || minStartStr} // Prevent end date before start
                              value={price.enddate}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].enddate = e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                                validateDateRange(updatedPrices[index], formData.days);
                              }}
                              required
                            />
                            <Input
                              label="Price"
                              type="number"
                              value={price.price === 0 ? "" : price.price}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].price = Number(e.target.value);
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                              required
                            />
                          </div>

                          {/* Flight Details */}
                          <Typography variant="small" color="blue-gray">
                            Outbound Flight
                          </Typography>
                          <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2">
                            <Input
                              label="Departure Time"
                              type="time"
                              value={price.flightDetails.outbound.departureTime}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[
                                  index
                                ].flightDetails.outbound.departureTime = e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                            <Input
                              label="Arrival Time"
                              type="time"
                              value={price.flightDetails.outbound.arrivalTime}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].flightDetails.outbound.arrivalTime =
                                  e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                            <Input
                              label="Airline"
                              value={price.flightDetails.outbound.airline}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].flightDetails.outbound.airline =
                                  e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                            <Input
                              label="Flight Number"
                              value={price.flightDetails.outbound.flightNumber}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].flightDetails.outbound.flightNumber =
                                  e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                          </div>

                          <Typography variant="small" color="blue-gray">
                            Return Flight
                          </Typography>
                          <div className="grid grid-cols-1 gap-2 p-2 md:grid-cols-2">
                            <Input
                              label="Departure Time"
                              type="time"
                              value={price.flightDetails.returnFlight.departureTime}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[
                                  index
                                ].flightDetails.returnFlight.departureTime = e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                            <Input
                              label="Arrival Time"
                              type="time"
                              value={price.flightDetails.returnFlight.arrivalTime}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[
                                  index
                                ].flightDetails.returnFlight.arrivalTime = e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                            <Input
                              label="Airline"
                              value={price.flightDetails.returnFlight.airline}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[index].flightDetails.returnFlight.airline =
                                  e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                            <Input
                              label="Flight Number"
                              value={price.flightDetails.returnFlight.flightNumber}
                              onChange={(e) => {
                                const updatedPrices = [...formData.prices];
                                updatedPrices[
                                  index
                                ].flightDetails.returnFlight.flightNumber = e.target.value;
                                setFormData({ ...formData, prices: updatedPrices });
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            {/* Checkboxes for Deal Features */}
            <div className="grid grid-cols-3">
              <div className="flex items-center">
                <Checkbox
                  color="orange"
                  checked={formData.isTopDeal}
                  onChange={() =>
                    setFormData({ ...formData, isTopDeal: !formData.isTopDeal })
                  }
                />
                <Typography>Top Deal</Typography>
              </div>
              <div className="flex items-center">
                <Checkbox
                  color="red"
                  checked={formData.isHotdeal}
                  onChange={() =>
                    setFormData({ ...formData, isHotdeal: !formData.isHotdeal })
                  }
                />
                <Typography>Hot Deal</Typography>
              </div>
              <div className="flex items-center">
                <Checkbox
                  color="green"
                  checked={formData.isFeatured}
                  onChange={() =>
                    setFormData({
                      ...formData,
                      isFeatured: !formData.isFeatured,
                    })
                  }
                />
                <Typography>Featured Deal</Typography>
              </div>
            </div>

            <Typography variant="h6">itinerary</Typography>
            {formData.itinerary.map((item, index) => (
              <div key={index} className="mb-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    label={`Day ${index + 1} Title`}
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...formData.itinerary];
                      updated[index] = {
                        ...updated[index],
                        title: e.target.value,
                      };
                      setFormData({ ...formData, itinerary: updated });
                    }}
                    className="flex-1"
                  />
                  {formData.itinerary.length > 1 && (
                    <Button
                      size="sm"
                      color="red"
                      onClick={() => {
                        const updated = formData.itinerary.filter(
                          (_, i) => i !== index,
                        );
                        setFormData({ ...formData, itinerary: updated });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <Input
                  label={`Day ${index + 1} Description`}
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...formData.itinerary];
                    updated[index] = {
                      ...updated[index],
                      description: e.target.value,
                    };
                    setFormData({ ...formData, itinerary: updated });
                  }}
                  textarea
                />

                <div className="mt-3">
                  <Typography variant="small" className="mb-2">Day {index + 1} Bulletpoints</Typography>
                  {item.bulletpoints && item.bulletpoints.length > 0 ? item.bulletpoints.map((bulletpoint, bulletIndex) => (
                    <div key={bulletIndex} className="mb-2 flex items-center gap-2">
                      <Input
                        label={`Bulletpoint ${bulletIndex + 1}`}
                        value={bulletpoint}
                        onChange={(e) => {
                          const updated = [...formData.itinerary];
                          updated[index] = {
                            ...updated[index],
                            bulletpoints: updated[index].bulletpoints.map((bp, bpIndex) =>
                              bpIndex === bulletIndex ? e.target.value : bp
                            ),
                          };
                          setFormData({ ...formData, itinerary: updated });
                        }}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        color="red"
                        onClick={() => {
                          const updated = [...formData.itinerary];
                          updated[index] = {
                            ...updated[index],
                            bulletpoints: updated[index].bulletpoints.filter(
                              (_, bpIndex) => bpIndex !== bulletIndex
                            ),
                          };
                          setFormData({ ...formData, itinerary: updated });
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  )) : (
                    <div className="text-gray-500 text-sm mb-2">No bulletpoints added</div>
                  )}
                  <Button
                    size="sm"
                    color="green"
                    onClick={() => {
                      const updated = [...formData.itinerary];
                      updated[index] = {
                        ...updated[index],
                        bulletpoints: [...updated[index].bulletpoints, ""],
                      };
                      setFormData({ ...formData, itinerary: updated });
                    }}
                  >
                    + Add Bulletpoint
                  </Button>
                </div>
              </div>
            ))}

            <Button
              size="sm"
              color="blue"
              onClick={() =>
                setFormData({
                  ...formData,
                  itinerary: [
                    ...formData.itinerary,
                    { title: "", description: "", bulletpoints: [""] }, // ← new object
                  ],
                })
              }
            >
              + Add Day
            </Button>

            <Typography variant="h6">What's Included</Typography>
            {formData.whatsIncluded.map((item, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <Input
                  label={`Item ${index + 1}`}
                  value={item}
                  onChange={(e) => {
                    const updated = [...formData.whatsIncluded];
                    updated[index] = e.target.value;
                    setFormData({ ...formData, whatsIncluded: updated });
                  }}
                  className="flex-1"
                />
                {formData.whatsIncluded.length > 1 && (
                  <Button
                    size="sm"
                    color="red"
                    onClick={() => {
                      const updated = formData.whatsIncluded.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, whatsIncluded: updated });
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
                  whatsIncluded: [...formData.whatsIncluded, ""],
                })
              }
            >
              + Add Item
            </Button>

            <Typography variant="h6">Exclusive Additions</Typography>
            {formData.exclusiveAdditions.map((item, index) => (
              <div key={index} className="mb-2 flex items-center gap-2">
                <Input
                  label={`Addition ${index + 1}`}
                  value={item}
                  onChange={(e) => {
                    const updated = [...formData.exclusiveAdditions];
                    updated[index] = e.target.value;
                    setFormData({ ...formData, exclusiveAdditions: updated });
                  }}
                  className="flex-1"
                />
                {formData.exclusiveAdditions.length > 1 && (
                  <Button
                    size="sm"
                    color="red"
                    onClick={() => {
                      const updated = formData.exclusiveAdditions.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, exclusiveAdditions: updated });
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
                  exclusiveAdditions: [...formData.exclusiveAdditions, ""],
                })
              }
            >
              + Add Addition
            </Button>

            <Typography variant="h6" className="hidden">
              Terms and Conditions
            </Typography>
            {formData.termsAndConditions.map((item, index) => (
              <div key={index} className="mb-2 flex hidden items-center gap-2">
                <Input
                  label={`Clause ${index + 1}`}
                  value={item}
                  onChange={(e) => {
                    const updated = [...formData.termsAndConditions];
                    updated[index] = e.target.value;
                    setFormData({ ...formData, termsAndConditions: updated });
                  }}
                  className="flex-1"
                />
                {formData.termsAndConditions.length > 1 && (
                  <Button
                    size="sm"
                    color="red"
                    onClick={() => {
                      const updated = formData.termsAndConditions.filter(
                        (_, i) => i !== index,
                      );
                      setFormData({ ...formData, termsAndConditions: updated });
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
              className="hidden"
              onClick={() =>
                setFormData({
                  ...formData,
                  termsAndConditions: [...formData.termsAndConditions, ""],
                })
              }
            >
              + Add Clause
            </Button>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <Input
                label="Number of Rooms"
                type="number"
                // value={formData.rooms}
                value={formData.rooms === 0 ? "" : formData.rooms}
                onChange={(e) =>
                  setFormData({ ...formData, rooms: Number(e.target.value) })
                }
              />
              <Input
                label="Number of Guests"
                type="number"
                // value={formData.guests}
                value={formData.guests === 0 ? "" : formData.guests}
                onChange={(e) =>
                  setFormData({ ...formData, guests: Number(e.target.value) })
                }
              />
              <Input
                label="Distance to Center (km)"
                value={formData.distanceToCenter}
                onChange={(e) =>
                  setFormData({ ...formData, distanceToCenter: e.target.value })
                }
              />
              <Input
                label="Distance to Beach (km)"
                value={formData.distanceToBeach}
                onChange={(e) =>
                  setFormData({ ...formData, distanceToBeach: e.target.value })
                }
              />
            </div>
            <Card className="mt-6 border border-blue-500 shadow-md">
              <CardHeader floated={false} color="blue" className="p-4">
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
                          alt={`Deal Image ${index + 1}`}
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

            {/* Image Upload */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Upload Images (JPG, JPEG, PNG only, max 5MB each, up to 10 images total)
              </label>
              <Input
                type="file"
                multiple
                ref={fileInputRef}
                name="images"
                accept="image/jpeg,image/jpg,image/png"
                label="Choose Image"
                onChange={(e) => {
                  const files = Array.from(e.target.files);

                  // Allow 10 images for both new and existing deals
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

            {/* Video Upload Section */}
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-2">
                Videos (Max 3)
              </Typography>
              <div className="flex items-center gap-4">
                <Input
                  type="file"
                  label="Upload Videos"
                  multiple
                  name="videos"
                  accept="video/mp4,video/mpeg,video/quicktime,video/x-matroska,video/x-msvideo"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    if (validateVideos(files)) {
                      setNewVideos(prev => [...prev, ...files]);
                      setFormData(prev => ({
                        ...prev,
                        videos: [...prev.videos, ...files.map(f => URL.createObjectURL(f))]
                      }));
                      setVideoError("");
                    }
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4">
                {formData.videos && formData.videos.length > 0 ? (
                  formData.videos.map((video, index) => (
                    <div key={index} className="relative">
                      {video.status === 'ready' ? (
                        <video
                          controls
                          src={video.url}
                          alt={`preview ${index}`}
                          className="h-24 w-full rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-24 w-full flex items-center justify-center rounded-md bg-gray-200">
                          <Typography variant="small" color="blue-gray">
                            {video.status === 'processing' ? 'Processing...' : 'Failed'}
                          </Typography>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(index, video)}
                        className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-semibold"
                  >
                    No videos to preview
                  </Typography>
                )}
              </div>
              {videoError && (
                <Alert color="red" className="mt-2">
                  {videoError}
                </Alert>
              )}
            </div>
          </form>
        </DialogBody>
        <DialogFooter className="flex-col items-center justify-center gap-2">
          {isSubmitting && uploadProgress > 0 && (
            <div className="w-full">
              <Progress value={uploadProgress} color="blue" label=" " />
              <Typography variant="small" color="blue-gray" className="text-center">
                {progressStatus} {uploadProgress < 100 ? `${uploadProgress}%` : ""}
              </Typography>
            </div>
          )}
          <div className="flex justify-end w-full">
          <Button
            onClick={handleCloseDialog}
            color="red"
            className="mr-2"
            variant="text"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="green" disabled={loading || isSubmitting}>
            {loading ? "Saving..." : "Save"}
          </Button>
          </div>
        </DialogFooter>
      </Dialog>

      {/*View Deal Dialog */}
      <Dialog open={openViewDialog} handler={handleCloseViewDialog} size="lg">
        <DialogHeader className="flex items-start justify-between bg-white p-4">
          <Typography
            variant="h5"
            className="flex items-center gap-2 text-deep-orange-400"
          >
            {currentDeal ? currentDeal.title : "Deal Details"}
          </Typography>
          <Typography
            variant="h6"
            className="flex items-center gap-2 text-deep-orange-400"
          >
            Tag: {currentDeal ? currentDeal.tag : "Deal Tag"}
          </Typography>
          <div className="flex items-center justify-center gap-2">
            <Tooltip
              content="Edit"
              placement="left"
              className="z-[50000] font-medium text-green-600"
              animate={{
                mount: { scale: 1, x: 0 },
                unmount: { scale: 0, x: 25 },
              }}
            >
              <Button
                variant="text"
                color="green"
                onClick={() => {
                  handleOpenDialog(currentDeal);
                  handleCloseViewDialog();
                }}
                className="p-2"
              >
                <PencilSquareIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="Delete"
              placement="top"
              className="z-[50000] font-medium text-red-500"
              color="red"
              animate={{
                mount: { scale: 1, y: 0 },
                unmount: { scale: 0, y: 25 },
              }}
            >
              <Button
                variant="text"
                color="red"
                onClick={() => {
                  confirmDelete(currentDeal._id, currentDeal.title);
                  handleCloseViewDialog();
                }}
                className="p-2"
              >
                <TrashIcon className="h-5 w-5" />
              </Button>
            </Tooltip>
            <Tooltip
              content="close"
              placement="right"
              className="z-[50000] font-medium text-purple-500"
              color="purple"
              animate={{
                mount: { scale: 1, x: -0 },
                unmount: { scale: 0, x: -25 },
              }}
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
          {currentDeal ? (
            <div className="space-y-12">
              {/* Basic Details Card */}
              <Card className="mt-6 border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Basic Details
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Title:
                    </span>{" "}
                    {currentDeal.title || "N/A"}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Description:
                    </span>{" "}
                    {currentDeal.description || "N/A"}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Low Deposite:
                    </span>{" "}
                    {currentDeal.LowDeposite || "N/A"}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Available Countries:
                    </span>{" "}
                    {Array.isArray(currentDeal.availableCountries)
                      ? currentDeal.availableCountries.join(", ")
                      : "N/A"}
                  </Typography>
                  <Typography variant="paragraph" className="text-black">
                    <span className="font-bold text-deep-orange-500">
                      Destination:
                    </span>{" "}
                    {currentDeal.destination
                      ? currentDeal.destination.name
                      : "N/A"}
                    
                    {/* Simple inline display for places */}
                    {/* {currentDeal.selectedPlaces && currentDeal.selectedPlaces.length > 0 && (
                      <span className="ml-2">
                        (Places: {currentDeal.selectedPlaces.map(place => {
                          if (typeof place === 'string') return place;
                          if (place.placeId && place.placeId.name) return place.placeId.name;
                          if (place.name) return place.name;
                          return "Place";
                        }).join(', ')})
                      </span>
                    )} */}
                    </Typography>
                  
                  {/* Places section */}
                                    {currentDeal.selectedPlaces && currentDeal.selectedPlaces.length > 0 && (
                    <>
                      {/* Primary destination places */}
                      <Typography variant="paragraph" className="text-black ml-4 mt-1 border-l-2 border-green-500 pl-2">
                        <span className="font-bold text-green-600">
                          Places in {currentDeal.destination?.name || "Primary Destination"}:
                        </span>{" "}
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentDeal.selectedPlaces
                            .filter(place => {
                              // Only show places that belong to the primary destination
                              if (!place.destinationId) return true; // Legacy format, assume primary
                              
                              const primaryDestId = currentDeal.destination?._id.toString();
                              const placeDestId = typeof place.destinationId === 'object'
                                ? place.destinationId._id.toString()
                                : place.destinationId.toString();
                                
                              return placeDestId === primaryDestId;
                            })
                            .map((place, idx) => {
                              // Find the actual place object from availablePlaces
                              const placeId = place.placeId || place;
                              const placeIdStr = typeof placeId === 'object' ? placeId._id : placeId;
                              const placeObj = availablePlaces.find(p => p._id.toString() === placeIdStr.toString());
                              
                              // Use the exact name from availablePlaces if found
                              const placeName = placeObj ? placeObj.name : 
                                (place.placeId?.name || 
                                (typeof place.placeId === 'object' ? place.placeId.name : 
                                (typeof place === 'object' && place.name ? place.name : `Place test ${idx+1}`)));
                              
                              return (
                                <span key={`primary-${idx}`} className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                                  {placeName}
                                </span>
                              );
                            })}
                        </div>
                      </Typography>

                      {/* Multicenter destination places */}
                      {currentDeal.destinations && currentDeal.destinations.length > 0 && (
                        currentDeal.destinations.map(dest => {
                          const destId = typeof dest === 'object' ? dest._id : dest;
                          const destName = typeof dest === 'object' ? dest.name : 
                            destinations.find(d => d._id === destId)?.name || dest;
                          
                          // Filter places for this destination
                          const destPlaces = currentDeal.selectedPlaces.filter(place => {
                            if (!place.destinationId) return false;
                            const placeDestId = typeof place.destinationId === 'object'
                              ? place.destinationId._id.toString()
                              : place.destinationId.toString();
                            return placeDestId === destId.toString();
                          });
                          
                          if (destPlaces.length === 0) return null;
                          
                          return (
                            <Typography key={destId} variant="paragraph" className="text-black ml-4 mt-2 border-l-2 border-blue-500 pl-2">
                              <span className="font-bold text-blue-600">
                                Places in {destName}:
                              </span>{" "}
                              <div className="flex flex-wrap gap-1 mt-1">
                                {destPlaces.map((place, idx) => {
                                  // Find the actual place object from availablePlaces
                                  const placeId = place.placeId || place;
                                  const placeIdStr = typeof placeId === 'object' ? placeId._id : placeId;
                                  const placeObj = availablePlaces.find(p => p._id.toString() === placeIdStr.toString());
                                  
                                  // Use the exact name from availablePlaces if found
                                  const placeName = placeObj ? placeObj.name : 
                                    (place.placeId?.name || 
                                    (typeof place.placeId === 'object' ? place.placeId.name : 
                                    (typeof place === 'object' && place.name ? place.name : `Place test ${idx+1}`)));
                                  
                                  return (
                                    <span key={`${destId}-${idx}`} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                      {placeName}
                                    </span>
                                  );
                                })}
                              </div>
                            </Typography>
                          );
                        })
                      )}
                    </>
                  )}
                </CardBody>
              </Card>

              {/* Flags & Categories Card */}
              <Card className="border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Flags & Categories
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  {/* Boolean flags */}
                  <div className="mb-4 flex items-center space-x-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        color="orange"
                        checked={currentDeal.isTopDeal}
                        disabled
                      />
                      <Typography variant="small">Top Deal</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        color="red"
                        checked={currentDeal.isHotdeal}
                        disabled
                      />
                      <Typography variant="small">Hot Deal</Typography>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        color="green"
                        checked={currentDeal.isFeatured}
                        disabled
                      />
                      <Typography variant="small">Featured</Typography>
                    </div>
                  </div>

                  {/* Holiday categories list */}
                  <Typography
                    variant="subtitle2"
                    className="mb-2 font-bold text-deep-orange-500"
                  >
                    Categories:
                  </Typography>
                  {Array.isArray(currentDeal.holidaycategories) &&
                  currentDeal.holidaycategories.length > 0 ? (
                    <ul className="list-disc pl-6 text-black">
                      {currentDeal.holidaycategories.map((catItem, idx) => {
                        const catId =
                          typeof catItem === "object" ? catItem._id : catItem;
                        const catObj = holidaycategories.find(
                          (h) => h._id === catId,
                        );
                        const displayName = catObj ? catObj.name : catId;
                        return <li key={idx}>{displayName}</li>;
                      })}
                    </ul>
                  ) : (
                    <Typography variant="paragraph" className="text-black">
                      No categories selected.
                    </Typography>
                  )}
                </CardBody>
              </Card>

              {/* Itinerary Card */}
              <Card className="border border-blue-500 font-medium shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Itinerary
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  {currentDeal.itinerary && currentDeal.itinerary.length > 0 ? (
                    <ol className="list-decimal space-y-4 pl-5 text-black">
                      {currentDeal.itinerary.map((item, index) => (
                        <li key={index}>
                          <strong>{item.title}</strong>
                          <p className="mb-2">{item.description}</p>
                          {item.bulletpoints && item.bulletpoints.length > 0 && item.bulletpoints.some(bp => bp.trim()) && (
                            <div className="ml-4">
                              <strong className="text-sm text-blue-600">Bulletpoints:</strong>
                              <ul className="list-disc pl-5 mt-1">
                                {item.bulletpoints.filter(bp => bp.trim()).map((bulletpoint, bpIndex) => (
                                  <li key={bpIndex} className="text-sm">{bulletpoint}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <Typography variant="paragraph" className="text-black">
                      No itinerary provided.
                    </Typography>
                  )}
                </CardBody>
              </Card>

              {/* Price Details Card */}
              <Card className="border border-blue-500 font-medium shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Price Details
                  </Typography>
                </CardHeader>

                <CardBody className="space-y-6 p-4">
                  {/* Pagination controls for prices */}
                  {currentDeal.prices && currentDeal.prices.length > 0 && (
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <select 
                          className="border border-amber-400 rounded px-2 py-1 text-sm bg-amber-50"
                          value={viewPricesPagination.itemsPerPage}
                          onChange={(e) => setViewPricesPagination(prev => ({ 
                            ...prev, 
                            itemsPerPage: parseInt(e.target.value),
                            currentPage: 1 // Reset to first page when changing items per page
                          }))}
                        >
                          <option value={10000}>None (Show All)</option>
                          <option value={5}>5 per page</option>
                          <option value={10}>10 per page</option>
                          <option value={20}>20 per page</option>
                          <option value={50}>50 per page</option>
                        </select>
                      </div>
                      
                      {currentDeal.prices.length > viewPricesPagination.itemsPerPage && (
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded disabled:opacity-50"
                            disabled={viewPricesPagination.currentPage === 1}
                            onClick={() => handleViewPricesPageChange(viewPricesPagination.currentPage - 1)}
                          >
                            &laquo;
                          </button>
                          
                          {Array.from({ length: Math.ceil(currentDeal.prices.length / viewPricesPagination.itemsPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                              const currentPage = viewPricesPagination.currentPage;
                              const totalPages = Math.ceil(currentDeal.prices.length / viewPricesPagination.itemsPerPage);
                              // Always show first and last page
                              if (page === 1 || page === totalPages) return true;
                              // Show pages around current page
                              if (page >= currentPage - 1 && page <= currentPage + 1) return true;
                              return false;
                            })
                            .map((page, i, filteredPages) => (
                              <React.Fragment key={page}>
                                {i > 0 && filteredPages[i - 1] + 1 !== page && (
                                  <span className="px-3 py-1">...</span>
                                )}
                                <button
                                  type="button"
                                  className={`px-3 py-1 rounded ${
                                    page === viewPricesPagination.currentPage
                                      ? "bg-amber-500 text-white"
                                      : "bg-amber-50 hover:bg-amber-100"
                                  }`}
                                  onClick={() => handleViewPricesPageChange(page)}
                                >
                                  {page}
                                </button>
                              </React.Fragment>
                            ))
                          }
                          
                          <button
                            type="button"
                            className="bg-amber-100 hover:bg-amber-200 px-3 py-1 rounded disabled:opacity-50"
                            disabled={viewPricesPagination.currentPage === Math.ceil(currentDeal.prices.length / viewPricesPagination.itemsPerPage)}
                            onClick={() => handleViewPricesPageChange(viewPricesPagination.currentPage + 1)}
                          >
                            &raquo;
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {currentDeal.prices && currentDeal.prices.length > 0 ? (
                    currentDeal.prices
                      .slice(
                        (viewPricesPagination.currentPage - 1) * viewPricesPagination.itemsPerPage,
                        viewPricesPagination.currentPage * viewPricesPagination.itemsPerPage
                      )
                      .map((price, pIndexInPage) => {
                        // Calculate actual index in the full prices array
                        const pIndex = (viewPricesPagination.currentPage - 1) * viewPricesPagination.itemsPerPage + pIndexInPage;
                        const isExpanded = expandedIndices.includes(pIndex);
                        return (
                          <div
                            key={pIndex}
                            className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-4"
                          >
                          <Typography
                            variant="subtitle1"
                            className="text-deep-orange-500"
                          >
                            Price Entry {pIndex + 1}
                          </Typography>

                          {/* Summary View */}
                          <div className="grid grid-cols-1 gap-3 text-sm text-black md:grid-cols-2">
                            <div>
                              <strong>Country:</strong> {price.country || "N/A"}
                            </div>
                            <div>
                              <strong>Hotel:</strong>{" "}
                              {(price.hotel && price.hotel.name) || "N/A"}
                            </div>
                            <div>
                              <strong>Start Date:</strong>{" "}
                              {price.startdate
                                ? new Date(price.startdate).toLocaleDateString()
                                : "N/A"}
                            </div>
                            <div>
                              <strong>Airport:</strong>{" "}
                              {price.airport && price.airport.length > 0
                                ? price.airport
                                    .map((airport) => {
                                      // Check if airport is already populated (has name/code properties)
                                      if (typeof airport === "object" && airport.name) {
                                        return `${airport.name} (${airport.code || "N/A"})`;
                                      }
                                      // If it's just an ObjectId, try to find it in our airports list
                                      else if (typeof airport === "string" || airport._id) {
                                        const airportId = typeof airport === "string" ? airport : airport._id;
                                        const airportObj = airports.find(
                                          (a) => a._id === airportId,
                                        );
                                        return airportObj
                                          ? `${airportObj.name} (${airportObj.code})`
                                          : `Unknown Airport (${airportId})`;
                                      }
                                      // Fallback for any other case
                                      else {
                                        return "Unknown Airport";
                                      }
                                    })
                                    .join(", ")
                                : "N/A"}
                            </div>
                            <div>
                              <strong>Price:</strong> {price.price || "N/A"}
                            </div>
                          </div>

                          {/* View More / Less */}
                          <div>
                            <Button
                              size="sm"
                              variant="text"
                              className="text-blue-600 underline"
                              onClick={() => toggleExpand(pIndex)}
                            >
                              {isExpanded ? "View Less" : "View More"}
                            </Button>
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && (
                            <div className="space-y-3 text-sm text-black">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                  <strong>End Date:</strong>{" "}
                                  {price.enddate
                                    ? new Date(
                                        price.enddate,
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </div>
                              </div>

                              {price.flightDetails && (
                                <>
                                  <Typography
                                    variant="subtitle2"
                                    className="mt-3 text-deep-orange-500"
                                  >
                                    Flight Details
                                  </Typography>
                                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                    <div>
                                      <strong>Outbound Departure:</strong>{" "}
                                      {price.flightDetails.outbound
                                        .departureTime || "N/A"}
                                    </div>
                                    <div>
                                      <strong>Outbound Arrival:</strong>{" "}
                                      {price.flightDetails.outbound
                                        .arrivalTime || "N/A"}
                                    </div>
                                    <div>
                                      <strong>Outbound Airline:</strong>{" "}
                                      {price.flightDetails.outbound.airline ||
                                        "N/A"}
                                    </div>
                                    <div>
                                      <strong>Outbound Flight Number:</strong>{" "}
                                      {price.flightDetails.outbound
                                        .flightNumber || "N/A"}
                                    </div>
                                    <div>
                                      <strong>Return Departure:</strong>{" "}
                                      {price.flightDetails.returnFlight
                                        .departureTime || "N/A"}
                                    </div>
                                    <div>
                                      <strong>Return Arrival:</strong>{" "}
                                      {price.flightDetails.returnFlight
                                        .arrivalTime || "N/A"}
                                    </div>
                                    <div>
                                      <strong>Return Airline:</strong>{" "}
                                      {price.flightDetails.returnFlight
                                        .airline || "N/A"}
                                    </div>
                                    <div>
                                      <strong>Return Flight Number:</strong>{" "}
                                      {price.flightDetails.returnFlight
                                        .flightNumber || "N/A"}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <Typography variant="paragraph" className="text-black">
                      No price details available.
                    </Typography>
                  )}
                </CardBody>
              </Card>

              {/* Images Card */}
              <Card className="border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Images
                  </Typography>
                </CardHeader>
                <CardBody className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(currentDeal.images) &&
                    currentDeal.images.length > 0 ? (
                      currentDeal.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Deal Image ${index + 1}`}
                          className="h-20 w-20 rounded object-cover"
                        />
                      ))
                    ) : (
                      <Typography variant="paragraph" className="text-black">
                        No images available.
                      </Typography>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card className="border border-blue-500 shadow-md">
                <CardHeader color="blue" className="p-4">
                  <Typography variant="h6" className="text-white">
                    Additional Details
                  </Typography>
                </CardHeader>
                <CardBody className="space-y-4 p-4 text-black">
                  {/* whatsIncluded */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Typography className="font-bold text-deep-orange-500">
                        What's Included
                      </Typography>
                      <Button
                        size="sm"
                        color="blue"
                        varient="gradient"
                        onClick={() => toggleSection("whatsIncluded")}
                      >
                        {expandedSection === "whatsIncluded"
                          ? "View Less"
                          : `View More`}
                      </Button>
                    </div>
                    {expandedSection === "whatsIncluded" && (
                      <ul className="mt-2 list-disc pl-5">
                        {currentDeal.whatsIncluded &&
                        currentDeal.whatsIncluded.length > 0 ? (
                          currentDeal.whatsIncluded.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li>No details available.</li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* exclusiveAdditions */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Typography className="font-bold text-deep-orange-500">
                        Exclusive Additions
                      </Typography>
                      <Button
                        size="sm"
                        varient="gradient"
                        color="blue"
                        onClick={() => toggleSection("exclusiveAdditions")}
                      >
                        {expandedSection === "exclusiveAdditions"
                          ? "View Less"
                          : "View More"}
                      </Button>
                    </div>
                    {expandedSection === "exclusiveAdditions" && (
                      <ul className="mt-2 list-disc pl-5">
                        {currentDeal.exclusiveAdditions &&
                        currentDeal.exclusiveAdditions.length > 0 ? (
                          currentDeal.exclusiveAdditions.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li>No details available.</li>
                        )}
                      </ul>
                    )}
                  </div>

                  {/* termsAndConditions */}
                  <div>
                    <div className="flex items-center justify-between">
                      <Typography className="font-bold text-deep-orange-500">
                        Terms & Conditions
                      </Typography>
                      <Button
                        size="sm"
                        color="blue"
                        varient="gradient"
                        onClick={() => toggleSection("termsAndConditions")}
                      >
                        {expandedSection === "termsAndConditions"
                          ? "View Less"
                          : "View More"}
                      </Button>
                    </div>
                    {expandedSection === "termsAndConditions" && (
                      <ul className="mt-2 list-disc pl-5">
                        {currentDeal.termsAndConditions &&
                        currentDeal.termsAndConditions.length > 0 ? (
                          currentDeal.termsAndConditions.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li>No details available.</li>
                        )}
                      </ul>
                    )}
                  </div>
                </CardBody>
              </Card>

              {/* Videos Section */}
              <div className="mb-4">
                <Typography variant="h6" color="blue-gray" className="mb-2">
                  Videos
                </Typography>
                <div className="grid grid-cols-3 gap-4">
                  {currentDeal?.videos?.length > 0 ? (
                    currentDeal.videos.map((video, index) => (
                      <div key={index} className="relative">
                        {video.status === 'ready' ? (
                          <video
                            controls
                            src={video.url}
                            alt={`deal video ${index}`}
                            className="h-24 w-full rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-24 w-full flex items-center justify-center rounded-md bg-gray-200">
                            <Typography variant="small" color="blue-gray">
                              {video.status === 'processing' ? 'Processing...' : 'Failed'}
                            </Typography>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-semibold"
                    >
                      No Videos Available
                    </Typography>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Typography variant="h6" className="text-black">
              No deal details available.
            </Typography>
          )}
        </DialogBody>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} handler={setOpenDeleteDialog}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-600">{dealName}</span>?
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="gray"
            onClick={() => setOpenDeleteDialog(false)}
            className="mr-1"
            disabled={deleteInProgress}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={() => handleDelete(deleteId)}
            disabled={deleteInProgress}
          >
            {deleteInProgress ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default ManageDeals;
