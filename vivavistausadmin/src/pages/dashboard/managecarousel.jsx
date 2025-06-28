import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";


export function ManageCarousel() {
  const [carousels, setCarousels] = useState([]);
  const [deals, setDeals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentCarousel, setCurrentCarousel] = useState(null);
  const [formData, setFormData] = useState({ images: [], deal: "" });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    fetchCarousels();
    fetchDeals();
  }, []);

  useEffect(() => {
    if (alert.message) {
      const timeout = setTimeout(() => {
        setAlert({ message: "", type: "" });
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [alert]);

  const fetchCarousels = async () => {
    try {
      const response = await axios.get("/carousel");
      setCarousels(response.data);
    } catch (error) {
      console.error("Error fetching carousels:", error);
      setAlert({ message: "Error fetching carousels", type: "red" });
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await axios.get("/carousel/deals");
      setDeals(response.data);
    } catch (error) {
      console.error("Error fetching deals:", error);
      setAlert({ message: "Error fetching deals", type: "red" });
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

  const handleOpenDialog = (carousel = null) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setCurrentCarousel(carousel);
    setFormData(carousel ? { 
      images: carousel.images, 
      deal: carousel.deal?._id || "" 
    } : { 
      images: [], 
      deal: "" 
    });
    setImageError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCarousel(null);
    setFormData({ images: [], deal: "" });
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For new carousel, require image. For edit, image is optional
    if (!currentCarousel && formData.images.length === 0) {
      setAlert({ message: "Please select an image", type: "red" });
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    // If there's an image error, don't proceed
    if (imageError) {
      setAlert({ message: imageError, type: "red" });
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    
    const formDataToSend = new FormData();
    
    // Only append image if one was selected
    if (formData.images.length > 0) {
      formDataToSend.append("images", formData.images[0]);
    }
    
    // Always append deal (can be empty string)
    formDataToSend.append("deal", formData.deal || "");

    try {
      if (currentCarousel) {
        await axios.put(`/carousel/${currentCarousel._id}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ message: "Carousel updated successfully!", type: "green" });
      } else {
        await axios.post("/carousel", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ message: "Carousel added successfully!", type: "green" });
      }
      fetchCarousels();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving carousel:", error);
      console.error("Error details:", error.response?.data);
      setAlert({ 
        message: error.response?.data?.message || "Error saving carousel", 
        type: "red" 
      });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setDeleteId(id);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      await axios.delete(`/carousel/${deleteId}`);
      setAlert({ message: "Carousel deleted successfully!", type: "green" });
      fetchCarousels();
    } catch (error) {
      console.error("Error deleting carousel:", error);
      setAlert({ message: "Error deleting carousel", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteInProgress(false);
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
          Add Carousel
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {carousels.map((carousel) => (
            <Card
              key={carousel._id}
              className="group w-full transform p-4 shadow-md transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-blue-50 hover:shadow-lg"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap justify-start gap-4">
                  {carousel.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Carousel Image ${index + 1}`}
                      className="h-48 w-96 rounded-md object-cover shadow-md transition-all duration-500 ease-in-out"
                    />
                  ))}
                </div>
                
                {carousel.deal && (
                  <div className="mt-2 rounded-md bg-blue-50 p-2">
                    <Typography variant="small" color="blue-gray" className="font-medium">
                      Linked Deal: {carousel.deal.title}
                    </Typography>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-4">
                  <Button
                    variant="text"
                    color="green"
                    onClick={() => handleOpenDialog(carousel)}
                    className="p-2"
                    disabled={buttonDisabled}
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="text"
                    color="red"
                    onClick={() => confirmDelete(carousel._id)}
                    className="p-2"
                    disabled={buttonDisabled}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader className="flex items-center justify-between">
          <Typography variant="h5" className="font-bold text-gray-800">
            {currentCarousel ? "Edit Carousel" : "Add Carousel"}
          </Typography>
        </DialogHeader>
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Upload Image (JPG, JPEG, PNG only, max 5MB)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple={false}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    if (validateImage(file)) {
                      setFormData({ ...formData, images: [file] });
                    } else {
                      e.target.value = null; // Reset the input
                    }
                  }
                }}
                required={!currentCarousel}
                disabled={isSubmitting}
                className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
              />
              {imageError && (
                <p className="mt-1 text-sm text-red-500">{imageError}</p>
              )}
            </div>
                         <div>
               <label className="mb-1 block text-sm font-medium text-gray-700">
                 Select Deal
               </label>
               <select
                 value={formData.deal}
                 onChange={(e) => setFormData({ ...formData, deal: e.target.value })}
                 disabled={isSubmitting}
                 className="block w-full max-h-48 overflow-y-auto rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
               >
                 <option value="">Select a deal</option>
                 {deals.map((deal) => (
                   <option key={deal._id} value={deal._id}>
                     {deal.title}
                   </option>
                 ))}
               </select>
             </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCloseDialog} color="red" variant="text" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="green" disabled={loading || isSubmitting}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={openDeleteDialog} handler={() => setOpenDeleteDialog(false)}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>Are you sure you want to delete this carousel?</DialogBody>
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

export default ManageCarousel;
