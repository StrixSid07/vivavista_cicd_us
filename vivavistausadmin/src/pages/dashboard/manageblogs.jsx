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
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Quill CSS
export function ManageBlog() {
  const [blogs, setblogs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentblog, setCurrentblog] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [blogName, setblogName] = useState("");

  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    content: "",
    imageFile: null,
    imagePreview: "",
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    fetchblogs();
  }, []);

  const fetchblogs = async () => {
    try {
      const response = await axios.get("/home/blogs");
      setblogs(response.data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setAlert({ message: "Error fetching blogs", type: "red" });
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

  const handleImageClick = (imageUrl) => {
    setPreviewImage(imageUrl);
    setOpenImageDialog(true);
  };

  const handleCloseImageDialog = () => {
    setPreviewImage(null);
    setOpenImageDialog(false);
  };
  const handleDeleteImage = async () => {
    if (!currentblog) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this image?",
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`/home/image/${currentblog._id}`);
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

  const handleOpenDialog = (blog = null) => {
    setCurrentblog(blog);
    setFormData(
      blog
        ? {
            title: blog.title,
            content: blog.content,
            imageFile: null,
            imagePreview: blog.image,
          }
        : {
            title: "",
            content: "",
            imageFile: null,
            imagePreview: "",
          },
    );
    setImageError("");
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentblog(null);
    setAlert({ message: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // If there's an image error, don't proceed
    if (imageError) {
      setAlert({ message: imageError, type: "red" });
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("content", formData.content);
      if (formData.imageFile) {
        data.append("images", formData.imageFile);
      }

      if (currentblog) {
        await axios.put(`/home/${currentblog._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({
          message: "blog updated successfully!",
          type: "green",
        });
      } else {
        await axios.post("/home/blogs", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAlert({ message: "blog added successfully!", type: "green" });
      }

      fetchblogs();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving blog:", error);
      setAlert({ message: "Error saving blog", type: "red" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, name) => {
    setDeleteId(id);
    setblogName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/home/blogs/${id}`);
      setAlert({
        message: "blog deleted successfully!",
        type: "green",
      });
      fetchblogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      setAlert({ message: "Error deleting blog", type: "red" });
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
          Add Blogs
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {blogs.map((blog) => (
            <Card
              key={blog._id}
              className="group flex flex-col gap-4 p-4 shadow-md transition-all duration-300 hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between"
            >
              {/* Left - Title and Content */}
              <div className="flex-1 space-y-2">
                <Typography
                  variant="h5"
                  className="flex items-center gap-2 font-semibold text-deep-orange-700"
                >
                  {blog.title}
                </Typography>
                <div
                  className="line-clamp-2 text-sm text-gray-700"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>

              {/* Center - Image */}
              <div className="w-full sm:w-40">
                <img
                  src={blog.image}
                  alt={blog.title}
                  onClick={() => handleImageClick(blog.image)}
                  className="h-28 w-full cursor-pointer rounded-md object-cover shadow-sm transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
              </div>

              {/* Right - Buttons */}
              <div className="flex items-center justify-end gap-4 pt-2 sm:pt-0">
                <Tooltip content="Edit" placement="top">
                  <Button
                    variant="text"
                    color="green"
                    onClick={() => handleOpenDialog(blog)}
                    className="p-2"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </Button>
                </Tooltip>
                <Tooltip content="Delete" placement="top">
                  <Button
                    variant="text"
                    color="red"
                    onClick={() => confirmDelete(blog._id, blog.title)}
                    className="p-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </Tooltip>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader className="flex items-center justify-between">
          {currentblog ? "Edit blog" : "Add blog"}{" "}
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

        {/* Make form scrollable inside DialogBody */}
        <DialogBody className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Blog Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Blog Content
              </label>
              <ReactQuill
                value={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value })
                }
                theme="snow"
                placeholder="Write your blog content here..."
                className="rounded-md bg-white"
                style={{ height: "200px", marginBottom: "60px" }}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link', 'image'],
                    ['clean']
                  ]
                }}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Upload Image (JPG, JPEG, PNG only, max 5MB)
              </label>
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
                    } else {
                      e.target.value = null; // Reset the input
                    }
                  }
                }}
                required={!currentblog}
                disabled={currentblog?.image && !formData.imageFile}
                className="block w-full text-sm text-gray-900 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-600 hover:file:bg-blue-100"
              />
              {imageError && (
                <p className="mt-1 text-sm text-red-500">{imageError}</p>
              )}
            </div>

            {formData.imagePreview && (
              <div className="relative mt-3 w-full">
                <img
                  src={formData.imagePreview}
                  alt="Preview"
                  className="h-32 w-full rounded object-cover" // ✅ Smaller image preview
                />
                {currentblog && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="absolute right-1 top-1 rounded-full bg-white/60 p-1 text-white hover:bg-red-100"
                  >
                    ❌
                  </button>
                )}
              </div>
            )}
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
          <span className="font-semibold text-red-600">{blogName}</span>?
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

export default ManageBlog;
