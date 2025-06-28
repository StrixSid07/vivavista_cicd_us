import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  Checkbox,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Tooltip,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";

export function ManageDestination() {
  const [destinations, setDestinations] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentDestination, setCurrentDestination] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [destinationName, setDestinationName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  
  // Places management
  const [openPlacesDialog, setOpenPlacesDialog] = useState(false);
  const [places, setPlaces] = useState([]);
  const [currentPlace, setCurrentPlace] = useState(null);
  const [openPlaceDialog, setOpenPlaceDialog] = useState(false);
  const [placeFormData, setPlaceFormData] = useState({
    name: ""
  });
  const [activePlacesDestinationId, setActivePlacesDestinationId] = useState(null);
  const [placesAddedCount, setPlacesAddedCount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    isPopular: false,
    imageFile: null,
    imagePreview: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get("/destinations/destinations");
      setDestinations(response.data);
    } catch (error) {
      console.error("Error fetching destinations:", error);
      setAlert({ message: "Error fetching destinations", type: "red" });
    }
  };
  
  const fetchPlaces = async (destinationId) => {
    try {
      const response = await axios.get(`/destinations/${destinationId}/places`);
      setPlaces(response.data);
    } catch (error) {
      console.error("Error fetching places:", error);
      setAlert({ message: "Error fetching places", type: "red" });
    }
  };

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setPreviewImage(null);
    setOpenImageDialog(false);
  };
  const handleDeleteImage = async () => {
    if (!currentDestination) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?",
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/destinations/image/${currentDestination._id}`);
      setFormData({
        ...formData,
        imagePreview: "",
        imageFile: null,
      });
      setAlert({ message: "Image deleted successfully!", type: "green" });
    } catch (error) {
      console.error("Error deleting image:", error);
      setAlert({ message: "Failed to delete image", type: "red" });
    }
  };

  // Helper function for validating image
  const validateImage = (file) => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, JPEG, and PNG files are allowed");
      return false;
    }
    
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setImageError("Image size must be less than 5MB");
      return false;
    }
    
    setImageError("");
    return true;
  };

  const handleOpenDialog = (destination = null) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setCurrentDestination(destination);
    setFormData(
      destination
        ? {
            name: destination.name,
            isPopular: destination.isPopular,
            imageFile: null,
            imagePreview: destination.image,
          }
        : {
            name: "",
            isPopular: false,
            imageFile: null,
            imagePreview: "",
          },
    );
    setImageError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentDestination(null);
    setAlert({ message: "", type: "" });
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    // Validate required fields
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setAlert({ message: "Destination name is required", type: "red" });
      return;
    }
    
    // For new destinations, image is required
    if (!currentDestination && !formData.imageFile) {
      setAlert({ message: "Image is required for new destinations", type: "red" });
      return;
    }
    
    // If there's an image error, don't proceed
    if (imageError) {
      setAlert({ message: imageError, type: "red" });
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);

    try {
      const data = new FormData();
      data.append("name", trimmedName);
      data.append("isPopular", formData.isPopular);
      if (formData.imageFile) {
        data.append("images", formData.imageFile);
      }

      if (currentDestination) {
        await axios.put(`/destinations/${currentDestination._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({
          message: "Destination updated successfully!",
          type: "green",
        });
      } else {
        await axios.post("/destinations", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ message: "Destination added successfully!", type: "green" });
      }

      fetchDestinations();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving destination:", error);
      setAlert({ message: "Error saving destination", type: "red" });
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
    setDestinationName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      await axios.delete(`/destinations/${id}`);
      setAlert({
        message: "Destination deleted successfully!",
        type: "green",
      });
      fetchDestinations();
    } catch (error) {
      console.error("Error deleting destination:", error);
      setAlert({ message: "Error deleting destination", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
      setDeleteInProgress(false);
    }
  };
  
  // Places management functions
  const handleOpenPlacesDialog = async (destination) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500);
    
    setCurrentDestination(destination);
    setActivePlacesDestinationId(destination._id);
    await fetchPlaces(destination._id);
    setOpenPlacesDialog(true);
  };
  
  const handleClosePlacesDialog = () => {
    setOpenPlacesDialog(false);
    setPlaces([]);
    // Keep the activePlacesDestinationId for potential place operations
  };
  
  const handleOpenPlaceDialog = (place = null) => {
    setCurrentPlace(place);
    setPlaceFormData(
      place
        ? {
            name: place.name
          }
        : {
            name: ""
          }
    );
    // Reset the counter when opening the dialog for adding new places
    if (!place) {
      setPlacesAddedCount(0);
    }
    setOpenPlaceDialog(true);
  };
  
  const handleClosePlaceDialog = () => {
    setOpenPlaceDialog(false);
    setCurrentPlace(null);
    setPlacesAddedCount(0);
    setAlert({ message: "", type: "" });
  };
  
  const handlePlaceSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const trimmedName = placeFormData.name.trim();
    if (!trimmedName) {
      setAlert({ message: "Place name is required", type: "red" });
      return;
    }
    
    // Use activePlacesDestinationId as a fallback if currentDestination is not available
    const destinationId = currentDestination?._id || activePlacesDestinationId;
    
    // Debug log
    console.log("Current destination:", currentDestination);
    console.log("Active places destination ID:", activePlacesDestinationId);
    console.log("Using destination ID:", destinationId);
    
    // Check if we have a valid destination ID
    if (!destinationId) {
      console.error("No destination ID available");
      setAlert({ message: "No destination selected", type: "red" });
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      if (currentPlace) {
        // Update existing place
        await axios.put(
          `/destinations/${destinationId}/places/${currentPlace._id}`,
          { name: trimmedName }
        );
        setAlert({ message: "Place updated successfully!", type: "green" });
        // Close dialog after updating
        handleClosePlaceDialog();
      } else {
        // Add new place
        console.log(`Adding place to destination ID: ${destinationId}`);
        await axios.post(
          `/destinations/${destinationId}/places`,
          { name: trimmedName }
        );
        
        // Increment the counter
        setPlacesAddedCount(prev => prev + 1);
        
        setAlert({ message: `Place added successfully! (${placesAddedCount + 1} added in this session)`, type: "green" });
        
        // Keep the dialog open for adding more places
        // Just clear the form for the next entry
        setPlaceFormData({ name: "" });
        setCurrentPlace(null);
      }
      
      // Refresh places list
      await fetchPlaces(destinationId);
    } catch (error) {
      console.error("Error saving place:", error);
      setAlert({ message: "Error saving place", type: "red" });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };
  
  const handleDeletePlace = async (placeId) => {
    // Use activePlacesDestinationId as a fallback if currentDestination is not available
    const destinationId = currentDestination?._id || activePlacesDestinationId;
    
    // Check if we have a valid destination ID
    if (!destinationId) {
      console.error("No destination ID available");
      setAlert({ message: "No destination selected", type: "red" });
      return;
    }
    
    try {
      await axios.delete(`/destinations/${destinationId}/places/${placeId}`);
      setAlert({ message: "Place deleted successfully!", type: "green" });
      await fetchPlaces(destinationId);
    } catch (error) {
      console.error("Error deleting place:", error);
      setAlert({ message: "Error deleting place", type: "red" });
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
        <Button 
          onClick={() => handleOpenDialog()} 
          color="blue"
          disabled={buttonDisabled}
        >
          Add Destination
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {destinations.map((destination) => (
            <Card
              key={destination._id}
              className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image section */}
                <div className="md:w-1/4">
                  {destination.image ? (
                    <img
                      src={destination.image}
                      alt={destination.name}
                      className="h-48 w-full cursor-pointer rounded-lg object-cover"
                      onClick={() => handleImageClick(destination.image)}
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center rounded-lg bg-gray-200">
                      <MapPinIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content section */}
                <div className="mt-4 flex flex-1 flex-col justify-between p-2 md:mt-0 md:p-4">
                  <div>
                    <Typography variant="h5" color="blue-gray" className="mb-2">
                      {destination.name}
                    </Typography>

                    <div className="mb-2 flex items-center">
                      <Typography
                        variant="small"
                        color={destination.isPopular ? "green" : "gray"}
                        className="font-medium"
                      >
                        {destination.isPopular ? "Popular Destination" : "Standard Destination"}
                      </Typography>
                    </div>
                    
                    <div className="mb-2">
                      <Typography variant="small" color="gray">
                        Places: {destination.places?.length || 0}
                      </Typography>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outlined"
                      color="blue"
                      className="flex items-center gap-2"
                      onClick={() => handleOpenDialog(destination)}
                    >
                      <PencilSquareIcon strokeWidth={2} className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="red"
                      className="flex items-center gap-2"
                      onClick={() => confirmDelete(destination._id, destination.name)}
                    >
                      <TrashIcon strokeWidth={2} className="h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      size="sm"
                      variant="outlined"
                      color="green"
                      className="flex items-center gap-2"
                      onClick={() => handleOpenPlacesDialog(destination)}
                    >
                      <MapPinIcon strokeWidth={2} className="h-4 w-4" />
                      Manage Places
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Destination Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader className="flex items-center justify-between">
          {currentDestination ? "Edit Destination" : "Add Destination"}
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
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Destination Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onBlur={(e) =>
                setFormData({ ...formData, name: e.target.value.trim() })
              }
              required
              disabled={isSubmitting}
            />

            <div className="flex items-center gap-2">
              <Checkbox
                id="isPopular"
                checked={formData.isPopular}
                onChange={(e) =>
                  setFormData({ ...formData, isPopular: e.target.checked })
                }
                disabled={isSubmitting}
              />
              <label
                htmlFor="isPopular"
                className="cursor-pointer text-gray-700"
              >
                Mark as Popular Destination
              </label>
            </div>

            <div>
              <Typography variant="small" className="mb-2 font-medium">
                Destination Image
              </Typography>
              <div className="flex flex-col items-start gap-2">
                {formData.imagePreview && (
                  <div className="relative mb-2">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="h-40 w-full rounded-lg object-cover"
                    />
                    <Button
                      size="sm"
                      color="red"
                      className="absolute right-2 top-2"
                      onClick={handleDeleteImage}
                      disabled={isSubmitting || !currentDestination}
                    >
                      Delete
                    </Button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/jpeg, image/jpg, image/png"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      if (validateImage(file)) {
                        setFormData({
                          ...formData,
                          imageFile: file,
                          imagePreview: URL.createObjectURL(file),
                        });
                      }
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full cursor-pointer rounded-lg border border-gray-300 bg-white p-2 text-sm text-gray-700 file:mr-4 file:rounded file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                {imageError && (
                  <Typography color="red" variant="small">
                    {imageError}
                  </Typography>
                )}
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleCloseDialog}
            className="mr-1"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">Saving...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            ) : currentDestination ? (
              "Update"
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </Dialog>
      
      {/* Places Management Dialog */}
      <Dialog open={openPlacesDialog} handler={handleClosePlacesDialog} size="lg">
        <DialogHeader className="flex items-center justify-between">
          {currentDestination && `Manage Places for ${currentDestination.name}`}
          <Button 
            color="green" 
            size="sm"
            onClick={() => currentDestination ? handleOpenPlaceDialog() : setAlert({ message: "No destination selected", type: "red" })}
          >
            Add New Place
          </Button>
        </DialogHeader>
        <DialogBody className="max-h-[70vh] overflow-y-auto">
          {alert.message && (
            <Alert
              color={alert.type}
              onClose={() => setAlert({ message: "", type: "" })}
              className="mb-4"
            >
              {alert.message}
            </Alert>
          )}
          
          {places.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {places.map((place) => (
                <Card key={place._id} className="p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <Typography variant="h6">
                      {place.name}
                    </Typography>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="blue"
                        variant="outlined"
                        onClick={() => handleOpenPlaceDialog(place)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        color="red"
                        variant="outlined"
                        onClick={() => handleDeletePlace(place._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <MapPinIcon className="h-16 w-16 text-gray-400" />
              <Typography variant="h6" color="gray" className="mt-2">
                No places added yet
              </Typography>
              <Typography variant="small" color="gray">
                Click "Add New Place" to add places to this destination
              </Typography>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button color="red" onClick={handleClosePlacesDialog}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
      
      {/* Add/Edit Place Dialog */}
      <Dialog open={openPlaceDialog} handler={handleClosePlaceDialog} size="md">
        <DialogHeader>
          {currentPlace ? "Edit Place" : (
            <div>
              <div className="flex items-center gap-2">
                <span>Add Places</span>
                {placesAddedCount > 0 && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    {placesAddedCount} added
                  </span>
                )}
              </div>
              <Typography variant="small" color="gray" className="mt-1">
                You can add multiple places without closing this dialog
              </Typography>
            </div>
          )}
        </DialogHeader>
        <DialogBody>
          {alert.message && (
            <Alert
              color={alert.type}
              onClose={() => setAlert({ message: "", type: "" })}
              className="mb-4"
            >
              {alert.message}
            </Alert>
          )}
          
          <form onSubmit={handlePlaceSubmit} className="space-y-4">
            <Input
              label="Place Name"
              value={placeFormData.name}
              onChange={(e) => setPlaceFormData({ ...placeFormData, name: e.target.value })}
              required
              autoFocus
            />
            
            {!currentPlace && placesAddedCount > 0 && (
              <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                <p className="font-medium">Places added in this session:</p>
                <p>{placesAddedCount} {placesAddedCount === 1 ? 'place' : 'places'} added successfully!</p>
                <p className="mt-1 text-xs">Click "Done" when finished or continue adding more places.</p>
              </div>
            )}
          </form>
        </DialogBody>
        <DialogFooter className="flex justify-between">
          <Button
            variant="text"
            color="red"
            onClick={handleClosePlaceDialog}
            className="mr-1"
            disabled={isSubmitting}
          >
            {currentPlace ? "Cancel" : "Done"}
          </Button>
          <Button
            variant="gradient"
            color="green"
            onClick={handlePlaceSubmit}
            disabled={isSubmitting || !placeFormData.name.trim()}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <span className="mr-2">Saving...</span>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            ) : currentPlace ? (
              "Update"
            ) : (
              "Add Place"
            )}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openImageDialog} handler={handleCloseImageDialog} size="xl">
        <DialogBody className="p-0">
          <img
            src={previewImage}
            alt="Preview"
            className="h-auto max-h-[800px] w-full rounded object-contain"
          />
        </DialogBody>
        <DialogFooter className="justify-end">
          <Button onClick={handleCloseImageDialog} color="red" variant="text">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
      <Dialog open={openDeleteDialog} handler={setOpenDeleteDialog}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-600">{destinationName}</span>?
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
}

export default ManageDestination;
