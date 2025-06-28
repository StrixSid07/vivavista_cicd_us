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

export function ManageHolidayCategorie() {
  const [holidays, setHolidays] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentHoliday, setCurrentHoliday] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // State for delete confirmation dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [holidayName, setHolidayName] = useState("");

  const [formData, setFormData] = useState({
    name: "",
  });

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axios.get("/holidays/holidays");
      setHolidays(response.data);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setAlert({ message: "Error fetching holidays", type: "red" });
    }
  };

  const handleOpenDialog = (holiday = null) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setCurrentHoliday(holiday);
    setFormData(
      holiday
        ? {
            name: holiday.name,
          }
        : { name: "" }
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentHoliday(null);
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
      if (currentHoliday) {
        await axios.put(`/holidays/${currentHoliday._id}`, formData);
        setAlert({
          message: "Holiday updated successfully!",
          type: "green",
        });
      } else {
        await axios.post("/holidays", formData);
        setAlert({ message: "Holiday added successfully!", type: "green" });
      }
      fetchHolidays();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving holiday:", error);
      setAlert({ message: "Error saving holiday", type: "red" });
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
    setHolidayName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      await axios.delete(`/holidays/${id}`);
      setAlert({
        message: "Holiday deleted successfully!",
        type: "green",
      });
      fetchHolidays();
    } catch (error) {
      console.error("Error deleting holiday:", error);
      setAlert({ message: "Error deleting holiday", type: "red" });
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
          Add Holiday Category
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {holidays.map((holiday) => (
            <Card
              key={holiday._id}
              className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex-1">
                  <Typography
                    variant="h5"
                    color="deep-orange"
                    className="flex items-center gap-2"
                  >
                    {holiday.name}
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
                      onClick={() => handleOpenDialog(holiday)}
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
                      onClick={() => confirmDelete(holiday._id, holiday.name)}
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
          {currentHoliday ? "Edit Holiday Category" : "Add Holiday Category"}
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
              label="Holiday Category Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
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
          <span className="font-semibold text-red-600">{holidayName}</span>?
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

export default ManageHolidayCategorie;
