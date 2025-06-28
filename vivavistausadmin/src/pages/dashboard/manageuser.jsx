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
  Select,
  Option,
  Alert,
  Tooltip,
  Switch,
} from "@material-tailwind/react";
import {
  PencilSquareIcon,
  TrashIcon,
  UserCircleIcon,
  EnvelopeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import axios from "@/utils/axiosInstance";

export function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user", // Default role
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "" });
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [userName, setUserName] = useState("");
  const [showAdmins, setShowAdmins] = useState(true); // true = show admins, false = show users
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      setAlert({ message: "Error fetching users", type: "red" });
    }
  };

  const handleOpenDialog = (user = null) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setCurrentUser(user);
    setFormData(
      user
        ? {
            name: user.name,
            email: user.email,
            password: "", // Do not pre-fill password for security reasons
            role: user.role,
          }
        : {
            name: "",
            email: "",
            password: "",
            role: "user",
          },
    );
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentUser(null);
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
      if (currentUser) {
        await axios.put(`/auth/users/${currentUser._id}`, formData);
        setAlert({ message: "User updated successfully!", type: "green" });
      } else {
        await axios.post("/auth/admin/create-user", formData);
        setAlert({ message: "User added successfully!", type: "green" });
      }
      fetchUsers();
      handleCloseDialog();
    } catch (error) {
      console.error("Error saving user:", error);
      setAlert({
        message: error.response?.data?.message || "Error saving user",
        type: "red",
      });
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
    setUserName(name);
    setOpenDeleteDialog(true);
  };

  const handleDelete = async (id) => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      await axios.delete(`/auth/users/${id}`);
      setAlert({ message: "User deleted successfully!", type: "green" });
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setAlert({ message: "Error deleting user", type: "red" });
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

      <div className="mb-4 flex flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Typography color="blue-gray" className="font-medium">
            {showAdmins ? "Showing Admins" : "Showing Users"}
          </Typography>
          <Switch
            checked={showAdmins}
            onChange={() => setShowAdmins(!showAdmins)}
            id="custom-switch-component"
            ripple={false}
            className="h-full w-full checked:bg-blue-500"
            containerProps={{
              className: "w-11 h-6",
            }}
            circleProps={{
              className: "before:hidden left-0.5 border-none",
            }}
          />
        </div>
        <Button onClick={() => handleOpenDialog()} color="blue" disabled={buttonDisabled}>
          Add User
        </Button>
      </div>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="space-y-6">
          {users
            .filter((user) =>
              showAdmins ? user.role === "admin" : user.role === "user",
            )
            .map((user) => (
              <Card
                key={user._id}
                className="group p-4 shadow-md transition-colors duration-300 ease-in-out hover:bg-blue-50"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <Typography
                      variant="h5"
                      color="deep-orange"
                      className="flex items-center justify-start gap-2"
                    >
                      <UserCircleIcon
                        strokeWidth={2}
                        className="h-5 w-5 text-deep-orange-600"
                      />
                      {user.name}
                    </Typography>
                    <Typography className="mt-1 flex items-center justify-start gap-2 font-medium text-blue-500">
                      <EnvelopeIcon
                        strokeWidth={2}
                        className="h-5 w-5 text-blue-600"
                      />
                      {user.email}
                    </Typography>
                    <Typography
                      className={`mt-1 flex items-center justify-start gap-2 font-medium ${
                        user.role === "admin"
                          ? "text-green-500"
                          : "text-gray-500"
                      }`}
                    >
                      <Cog6ToothIcon
                        strokeWidth={2}
                        className="h-5 w-5 text-gray-600"
                      />
                      Role: {user.role}
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
                        onClick={() => handleOpenDialog(user)}
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
                        onClick={() => confirmDelete(user._id, user.name)}
                        className="p-2"
                        disabled={buttonDisabled || user._id === localStorage.getItem("userId")}
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
          {currentUser ? "Edit User" : "Add User"}
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
              label="Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <Input
              label={currentUser ? "New Password (leave empty to keep current)" : "Password"}
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required={!currentUser}
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              required
            >
              <Option value="user">User</Option>
              <Option value="admin">Admin</Option>
            </Select>
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
          <span className="font-semibold text-red-600">{userName}</span>?
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

export default ManageUsers;
