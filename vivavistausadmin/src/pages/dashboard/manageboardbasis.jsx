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

export function ManageBoardBasis() {
  const [boardbasiss, setBoardbasiss] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentBoardbasis, setCurrentBoardbasis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [boardbasisName, setBoardbasisName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchBoardbasiss();
  }, []);

  const fetchBoardbasiss = async () => {
    try {
      const response = await axios.get("/boardbasis/boardbasis");
      setBoardbasiss(response.data);
    } catch (error) {
      console.error("Error fetching board basis:", error);
      setAlert({ message: "Error fetching board basis", type: "red" });
    }
  };

  const handleOpenDialog = (boardbasis = null) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setCurrentBoardbasis(boardbasis);
    setFormData(
      boardbasis
        ? {
            name: boardbasis.name,
          }
        : { name: "" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentBoardbasis(null);
    setAlert({ message: "", type: "" });
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isSubmitting) return;
    
    // Trim the name and validate
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      setAlert({ message: "Board Basis name is required", type: "red" });
      return;
    }
    
    setIsSubmitting(true);
    setLoading(true);
    
    try {
      const trimmedFormData = { name: trimmedName };
      
      if (currentBoardbasis) {
        await axios.put(`/boardbasis/${currentBoardbasis._id}`, trimmedFormData);
        setAlert({
          message: "Board Basis updated successfully!",
          type: "green",
        });
      } else {
        await axios.post("/boardbasis", trimmedFormData);
        setAlert({ message: "Board Basis added successfully!", type: "green" });
      }
      fetchBoardbasiss();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving board basis:", error);
      const message = error.response?.data?.message || "Error saving board basis";
      setAlert({ message, type: "red" });
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
    setBoardbasisName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      await axios.delete(`/boardbasis/${id}`);
      setAlert({
        message: "Board Basis deleted successfully!",
        type: "green",
      });
      fetchBoardbasiss();
    } catch (error) {
      console.error("Error deleting board basis:", error);
      setAlert({ message: "Error deleting board basis", type: "red" });
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
        <Button onClick={() => handleOpenDialog()} color="blue" disabled={buttonDisabled}>
          Add Board Basis
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {boardbasiss.map((boardbasis) => (
            <Card
              key={boardbasis._id}
              className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Typography
                    variant="h5"
                    color="deep-orange"
                    className="flex items-center gap-2"
                  >
                    {boardbasis.name}
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
                      onClick={() => handleOpenDialog(boardbasis)}
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
                      onClick={() => confirmDelete(boardbasis._id, boardbasis.name)}
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

      <Dialog open={openDialog} handler={handleCloseDialog} size="md">
        <DialogHeader className="flex items-center justify-between">
          {currentBoardbasis ? "Edit Board Basis" : "Add Board Basis"}
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
              label="Board Basis Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              onBlur={(e) =>
                setFormData({ ...formData, name: e.target.value.trim() })
              }
              required
            />
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        handler={() => setOpenDeleteDialog(false)}
      >
        <DialogHeader>Confirm Delete</DialogHeader>
        <DialogBody>
          Are you sure you want to delete{" "}
          <span className="font-semibold text-red-600">{boardbasisName}</span>?
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

export default ManageBoardBasis;
