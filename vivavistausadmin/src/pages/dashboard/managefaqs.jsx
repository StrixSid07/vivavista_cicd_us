import React, { useEffect, useState } from "react";
import {
  Typography,
  Button,
  Card,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
  Tooltip,
} from "@material-tailwind/react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";

export function ManageFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentFAQ, setCurrentFAQ] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    contactNumber: "",
    lists: [],
    linktitle: [],
    links: [],
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [faqQuestion, setFaqQuestion] = useState("");

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await axios.get("/faqs");
      setFaqs(response.data);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setAlert({ message: "Error fetching FAQs", type: "red" });
    }
  };

  const handleOpenDialog = (faq = null) => {
    setCurrentFAQ(faq);
    setFormData(
      faq
        ? {
            question: faq.question,
            answer: faq.answer,
            contactNumber: faq.contactNumber,
            lists: faq.lists,
            linktitle: faq.linktitle,
            links: faq.links,
          }
        : {
            question: "",
            answer: "",
            contactNumber: "",
            lists: [],
            linktitle: [],
            links: [],
          },
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentFAQ(null);
    setAlert({ message: "", type: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentFAQ) {
        await axios.put(`/faqs/${currentFAQ._id}`, formData);
        setAlert({ message: "FAQ updated successfully!", type: "green" });
      } else {
        await axios.post("/faqs", formData);
        setAlert({ message: "FAQ added successfully!", type: "green" });
      }
      fetchFAQs();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      setAlert({ message: "Error saving FAQ", type: "red" });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id, question) => {
    setDeleteId(id);
    setFaqQuestion(question);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/faqs/${id}`);
      setAlert({ message: "FAQ deleted successfully!", type: "green" });
      fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      setAlert({ message: "Error deleting FAQ", type: "red" });
    } finally {
      setOpenDeleteDialog(false);
      setDeleteId(null);
    }
  };

  // Functions for managing lists, link titles, and links
  const handleListChange = (index, value) => {
    const updatedLists = [...formData.lists];
    updatedLists[index] = value;
    setFormData({ ...formData, lists: updatedLists });
  };

  const handleRemoveList = (index) => {
    const updatedLists = formData.lists.filter((_, i) => i !== index);
    setFormData({ ...formData, lists: updatedLists });
  };

  const handleAddList = () => {
    setFormData({ ...formData, lists: [...formData.lists, ""] });
  };

  const handleLinkTitleChange = (index, value) => {
    const updatedLinkTitles = [...formData.linktitle];
    updatedLinkTitles[index] = value;
    setFormData({ ...formData, linktitle: updatedLinkTitles });
  };

  const handleRemoveLinkTitle = (index) => {
    const updatedLinkTitles = formData.linktitle.filter((_, i) => i !== index);
    setFormData({ ...formData, linktitle: updatedLinkTitles });
  };

  const handleAddLinkTitle = () => {
    setFormData({ ...formData, linktitle: [...formData.linktitle, ""] });
  };

  const handleLinkChange = (index, value) => {
    const updatedLinks = [...formData.links];
    updatedLinks[index] = value;
    setFormData({ ...formData, links: updatedLinks });
  };

  const handleRemoveLink = (index) => {
    const updatedLinks = formData.links.filter((_, i) => i !== index);
    setFormData({ ...formData, links: updatedLinks });
  };

  const handleAddLink = () => {
    setFormData({ ...formData, links: [...formData.links, ""] });
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
          Add FAQ
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {faqs.map((faq) => (
            <Card
              key={faq._id}
              className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Typography
                    variant="h5"
                    color="deep-orange"
                    className="flex items-center justify-start gap-2"
                  >
                    {faq.question}
                  </Typography>
                  <Typography className="mt-1 font-medium text-blue-500">
                    {faq.answer}
                  </Typography>
                </div>

                <div className="flex items-center gap-4">
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
                      onClick={() => handleOpenDialog(faq)}
                      className="p-2"
                    >
                      <PencilSquareIcon className="h-5 w-5" />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    content="Delete"
                    placement="top"
                    className="font-medium text-red-500"
                    animate={{
                      mount: { scale: 1, y: 0 },
                      unmount: { scale: 0, y: 25 },
                    }}
                  >
                    <Button
                      variant="text"
                      color="red"
                      onClick={() => confirmDelete(faq._id, faq.question)}
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

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader className="flex items-center justify-between">
          {currentFAQ ? "Edit FAQ" : "Add FAQ"}
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
        <DialogBody className="h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-deep-orange-500">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Question"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              required
            />
            <Input
              label="Answer"
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              required
            />
            <Input
              label="Contact Number"
              value={formData.contactNumber}
              onChange={(e) =>
                setFormData({ ...formData, contactNumber: e.target.value })
              }
            />

            {/* Lists Section */}
            <div>
              <Typography variant="h6">Lists</Typography>
              {formData.lists.map((list, index) => (
                <div key={index} className="mt-2 flex items-center">
                  <Input
                    label={`List ${index + 1}`}
                    value={list}
                    onChange={(e) => handleListChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    color="red"
                    onClick={() => handleRemoveList(index)}
                    variant="text"
                    className="ml-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button color="blue" onClick={handleAddList} className="mt-2">
                Add Another List
              </Button>
            </div>

            {/* Link Titles Section */}
            <div>
              <Typography variant="h6">Link Titles</Typography>
              {formData.linktitle.map((linktitle, index) => (
                <div key={index} className="mt-2 flex items-center">
                  <Input
                    label={`Link Title ${index + 1}`}
                    value={linktitle}
                    onChange={(e) =>
                      handleLinkTitleChange(index, e.target.value)
                    }
                    className="flex-1"
                  />
                  <Button
                    color="red"
                    onClick={() => handleRemoveLinkTitle(index)}
                    variant="text"
                    className="ml-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                color="blue"
                onClick={handleAddLinkTitle}
                className="mt-2"
              >
                Add Another Link Title
              </Button>
            </div>

            {/* Links Section */}
            <div>
              <Typography variant="h6">Links</Typography>
              {formData.links.map((link, index) => (
                <div key={index} className="mt-2 flex items-center">
                  <Input
                    label={`Link ${index + 1}`}
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    color="red"
                    onClick={() => handleRemoveLink(index)}
                    variant="text"
                    className="ml-2"
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button color="blue" onClick={handleAddLink} className="mt-2">
                Add Another Link
              </Button>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} handler={setOpenDeleteDialog}>
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-600">{faqQuestion}</span>?
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

export default ManageFaqs;
