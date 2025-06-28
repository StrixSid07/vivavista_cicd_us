import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  Input,
  Textarea,
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
  PhotoIcon,
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";


export function ManageAutoslider() {
  const [autosliders, setAutosliders] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentAutoslider, setCurrentAutoslider] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDeleteImageDialog, setOpenDeleteImageDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [autosliderTitle, setAutosliderTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [deleteImageInProgress, setDeleteImageInProgress] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageFile: null,
    imagePreview: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    fetchAutosliders();
  }, []);

  const fetchAutosliders = async () => {
    try {
      const response = await axios.get("/autoslider");
      setAutosliders(response.data);
    } catch (error) {
      console.error("Error fetching autosliders:", error);
      setAlert({ message: "Error fetching autosliders", type: "red" });
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

  const handleDeleteImageConfirm = () => {
    if (!currentAutoslider) return;

    // Don't show delete confirmation if there's no image
    if (!formData.imagePreview && !currentAutoslider.image) {
      setAlert({ message: "No image to delete", type: "blue" });
      return;
    }

    setOpenDeleteImageDialog(true);
  };

  const handleDeleteImage = async () => {
    if (!currentAutoslider) return;
    
    setDeleteImageInProgress(true);

    try {
      console.log("Attempting to delete image for autoslider ID:", currentAutoslider._id);
      const response = await axios.delete(`/autoslider/image/${currentAutoslider._id}`);
      console.log("Server response:", response.data);
      
      // Update the form data to reflect the image removal
      setFormData({
        ...formData,
        imagePreview: "",
        imageFile: null,
      });
      
      // Refresh the list to get updated data
      await fetchAutosliders();
      
      // Update current autoslider reference to reflect the change
      if (currentAutoslider) {
        currentAutoslider.image = null;
      }
      
      setAlert({ 
        message: response.data.modified 
          ? "Image deleted successfully!" 
          : "Image reference cleared (no actual image was present)",
        type: "green" 
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      
      let errorMessage = "Failed to delete image";
      if (error.response) {
        console.error("Server error response:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      setAlert({ message: errorMessage, type: "red" });
    } finally {
      setDeleteImageInProgress(false);
      setOpenDeleteImageDialog(false);
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

  const handleOpenDialog = (autoslider = null) => {
    if (buttonDisabled) return;

    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms

    setCurrentAutoslider(autoslider);
    setFormData(
      autoslider
        ? {
          title: autoslider.title,
          description: autoslider.description,
          imageFile: null,
          imagePreview: autoslider.image,
        }
        : {
          title: "",
          description: "",
          imageFile: null,
          imagePreview: "",
        },
    );
    setImageError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentAutoslider(null);
    setAlert({ message: "", type: "" });
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent duplicate submissions
    if (isSubmitting) return;

    // Validate required fields
    if (!formData.title || !formData.description) {
      setAlert({ message: "Title and description are required", type: "red" });
      return;
    }

    // For new autosliders, image is required
    if (!currentAutoslider && !formData.imageFile) {
      setAlert({ message: "Image is required for new autoslider", type: "red" });
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
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (formData.imageFile) {
        data.append("images", formData.imageFile);
      }

      if (currentAutoslider) {
        await axios.put(`/autoslider/${currentAutoslider._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({
          message: "Autoslider updated successfully!",
          type: "green",
        });
      } else {
        await axios.post("/autoslider", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ message: "Autoslider added successfully!", type: "green" });
      }

      fetchAutosliders();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving autoslider:", error);
      setAlert({ message: "Error saving autoslider", type: "red" });
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id, title) => {
    if (buttonDisabled) return;

    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms

    setDeleteId(id);
    setAutosliderTitle(title);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    if (deleteInProgress) return;

    try {
      setDeleteInProgress(true);
      await axios.delete(`/autoslider/${id}`);
      setAlert({
        message: "Autoslider deleted successfully!",
        type: "green",
      });
      fetchAutosliders();
    } catch (error) {
      console.error("Error deleting autoslider:", error);
      setAlert({ message: "Error deleting autoslider", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
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
        <Button
          onClick={() => handleOpenDialog()}
          className="flex items-center gap-2"
          color="blue"
          disabled={buttonDisabled}
        >
          <PhotoIcon className="h-5 w-5" />
          Add New Autoslider
        </Button>
      </div>

      <Card className="h-full w-full overflow-auto p-4">
        <Typography variant="h4" color="blue-gray" className="mb-4">
          Manage Autoslider
        </Typography>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {autosliders.map((autoslider) => (
            <Card
              key={autoslider._id}
              className="overflow-hidden shadow-lg transition-all hover:shadow-xl"
            >
              <div
                className="relative h-56 cursor-pointer bg-gray-200"
                onClick={() => handleImageClick(autoslider.image)}
              >
                {autoslider.image ? (
                  <img
                    src={autoslider.image}
                    alt={autoslider.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PhotoIcon className="h-16 w-16 text-gray-400" />
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>

              <div className="p-4">
                <Typography variant="h5" color="blue-gray" className="mb-2">
                  {autoslider.title}
                </Typography>
                <Typography color="gray" className="mb-4 line-clamp-2">
                  {autoslider.description}
                </Typography>

                <div className="mt-4 flex justify-end gap-2">
                  <Tooltip content="Edit">
                    <Button
                      size="sm"
                      color="blue"
                      className="p-2"
                      onClick={() => handleOpenDialog(autoslider)}
                      disabled={buttonDisabled}
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button
                      size="sm"
                      color="red"
                      className="p-2"
                      onClick={() => confirmDelete(autoslider._id, autoslider.title)}
                      disabled={buttonDisabled}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {autosliders.length === 0 && (
          <div className="mt-8 flex flex-col items-center justify-center">
            <PhotoIcon className="h-16 w-16 text-gray-400" />
            <Typography color="gray" className="mt-2">
              No autosliders found. Click the "Add New Autoslider" button to create one.
            </Typography>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader>
          {currentAutoslider ? "Edit Autoslider" : "Add New Autoslider"}
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <DialogBody divider>
            <div className="grid gap-4">
              <div>
                <Input
                  size="lg"
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <Textarea
                  size="lg"
                  label="Description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Upload Image
                </label>
                <div className="mb-1 text-xs text-blue-600">
                  Only JPG, JPEG, PNG formats allowed. Maximum size: 5MB.
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
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
                  required={!currentAutoslider} // Required only for adding new
                  disabled={isSubmitting || (currentAutoslider?.image && !formData.imageFile)}
                  className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
                />
                {imageError && (
                  <div className="mt-1 text-sm text-red-500">{imageError}</div>
                )}
              </div>

              {/* Image Preview */}
              {formData.imagePreview && (
                <div className="relative mt-2">
                  <div className="relative h-40 w-full overflow-hidden rounded-lg">
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  {currentAutoslider?.image && !formData.imageFile && (
                    <Button
                      color="red"
                      size="sm"
                      className="absolute right-2 top-2"
                      onClick={handleDeleteImageConfirm}
                      disabled={isSubmitting || deleteImageInProgress}
                    >
                      Remove Image
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogBody>
          <DialogFooter className="flex justify-between">
            <Button
              variant="outlined"
              color="red"
              onClick={handleCloseDialog}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              color="green"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog
        open={openImageDialog}
        handler={handleCloseImageDialog}
        size="lg"
      >
        <DialogHeader>Image Preview</DialogHeader>
        <DialogBody>
          {previewImage && (
            <img
              src={previewImage}
              alt="Full preview"
              className="h-auto w-full rounded-lg"
            />
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="gray"
            onClick={handleCloseImageDialog}
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} handler={() => setOpenDeleteDialog(false)} size="sm">
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete the autoslider with title "{autosliderTitle}"?
          This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outlined"
            color="gray"
            onClick={() => setOpenDeleteDialog(false)}
            disabled={deleteInProgress}
            className="mr-2"
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

      {/* Delete Image Confirmation Dialog */}
      <Dialog open={openDeleteImageDialog} handler={() => setOpenDeleteImageDialog(false)} size="sm">
        <DialogHeader>Confirm Delete Image</DialogHeader>
        <DialogBody>
          Are you sure you want to delete this image?
          This action cannot be undone.
        </DialogBody>
        <DialogFooter>
          <Button
            variant="outlined"
            color="gray"
            onClick={() => setOpenDeleteImageDialog(false)}
            disabled={deleteImageInProgress}
            className="mr-2"
          >
            Cancel
          </Button>
          <Button
            variant="gradient"
            color="red"
            onClick={handleDeleteImage}
            disabled={deleteImageInProgress}
          >
            {deleteImageInProgress ? "Deleting..." : "Delete Image"}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
} 