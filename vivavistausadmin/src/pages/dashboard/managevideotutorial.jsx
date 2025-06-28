import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Alert,
} from "@material-tailwind/react";
import { PlayIcon } from "@heroicons/react/24/solid";

const tutorials = [
  {
    id: 1,
    title: "Admin Login",
    videoUrl: "/videosmp4/AdminLogin.mp4",
    notes: "This tutorial covers how to log into the admin dashboard securely.",
    checklist: [
      "Open login page",
      "Enter valid credentials",
      "Access the dashboard",
    ],
  },
  {
    id: 2,
    title: "Manage Airport",
    videoUrl: "/videosmp4/ManageAirport.mp4",
    notes: "How to add, edit, or remove airports in the system.",
    checklist: [
      "Go to Manage Airports",
      "Add new airport details",
      "Save and verify changes",
    ],
  },
  {
    id: 3,
    title: "Manage Blogs",
    videoUrl: "/videosmp4/ManageBlogs.mp4",
    notes: "Manage blog posts for the website.",
    checklist: [
      "Open Blog Management",
      "Add or edit blog content",
      "Publish updates",
    ],
  },
  {
    id: 4,
    title: "Manage Board Basis",
    videoUrl: "/videosmp4/ManageBoardBasis.mp4",
    notes:
      "Handle board basis options such as All-Inclusive or Bed & Breakfast.",
    checklist: [
      "Navigate to Board Basis settings",
      "Add or edit entries",
      "Save changes",
    ],
  },
  {
    id: 5,
    title: "Manage Carousel",
    videoUrl: "/videosmp4/ManageCarousel.mp4",
    notes: "Learn to update homepage carousel images.",
    checklist: [
      "Go to Carousel section",
      "Upload new images",
      "Delete outdated ones",
    ],
  },
  {
    id: 6,
    title: "Manage Deals",
    videoUrl: "/videosmp4/ManageDeals.mp4",
    notes: "Create and manage travel deals and offers.",
    checklist: [
      "Open Deals Management",
      "Use filters and edit tools",
      "Save or remove deals",
    ],
  },
  {
    id: 7,
    title: "Manage Deals External",
    videoUrl: "/videosmp4/ManageDealsExternal.mp4",
    notes: "Upload and manage external deals via Excel.",
    checklist: [
      "Go to External Deals",
      "Download and edit Excel template",
      "Re-upload for batch update",
    ],
  },
  {
    id: 8,
    title: "Manage Destinations",
    videoUrl: "/videosmp4/ManageDestinations.mp4",
    notes: "Manage destination entries for packages.",
    checklist: [
      "Navigate to Destinations",
      "Add or remove destinations",
      "Link destinations to packages",
    ],
  },
  {
    id: 9,
    title: "Manage FAQs",
    videoUrl: "/videosmp4/ManageFaqs.mp4",
    notes: "Create and organize frequently asked questions.",
    checklist: [
      "Go to FAQ section",
      "Add new questions",
      "Update or remove answers",
    ],
  },
  {
    id: 10,
    title: "Manage Holiday Categories",
    videoUrl: "/videosmp4/ManageHolidayCategories.mp4",
    notes: "Edit and assign holiday categories to deals.",
    checklist: [
      "Access Holiday Categories",
      "Add new or update existing ones",
      "Link to appropriate deals",
    ],
  },
  {
    id: 11,
    title: "Manage Hotels",
    videoUrl: "/videosmp4/ManageHotels.mp4",
    notes: "Maintain hotel records including images and info.",
    checklist: [
      "Open Hotel Management",
      "Edit hotel details",
      "Save and publish",
    ],
  },
  {
    id: 12,
    title: "Manage Terms",
    videoUrl: "/videosmp4/ManageTerms.mp4",
    notes: "Configure booking terms and policies.",
    checklist: [
      "Go to Terms section",
      "Add or edit policies",
      "Save and display updates",
    ],
  },
  {
    id: 13,
    title: "Manage Users",
    videoUrl: "/videosmp4/ManageUser.mp4",
    notes: "Handle user accounts and admin access.",
    checklist: [
      "Open User Management",
      "Edit roles and permissions",
      "Disable or delete users",
    ],
  },
];

export function AdminVideoTutorials() {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);

  const handleOpenDialog = (tutorial) => {
    if (buttonDisabled) return;
    
    setButtonDisabled(true);
    setTimeout(() => setButtonDisabled(false), 500); // Prevent double-clicks for 500ms
    
    setSelectedTutorial(tutorial);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTutorial(null);
  };

  return (
    <div className="h-screen w-full overflow-hidden px-4 py-6">
      <Typography variant="h4" className="mb-6 text-blue-700">
        Admin Video Tutorials
      </Typography>

      <Card className="h-[calc(100vh-150px)] overflow-y-auto rounded-xl p-4 shadow-lg scrollbar-thin scrollbar-track-gray-200 scrollbar-thumb-blue-500">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tutorials.map((tutorial) => (
            <Card
              key={tutorial.id}
              className="flex flex-col justify-between rounded-lg p-4 shadow-md transition hover:bg-blue-50 hover:shadow-lg"
            >
              <div>
                <Typography
                  variant="h6"
                  className="mb-3 text-lg font-semibold text-deep-orange-500"
                >
                  {tutorial.title}
                </Typography>

                <div className="relative w-full overflow-hidden rounded-lg">
                  <video
                    src={tutorial.videoUrl}
                    controls
                    className="h-40 w-full rounded-md object-cover shadow"
                  />
                </div>

                <Typography className="mt-3 text-sm text-gray-700">
                  {tutorial.notes}
                </Typography>
              </div>

              <div className="mt-4">
                <Button
                  color="blue"
                  onClick={() => handleOpenDialog(tutorial)}
                  className="flex items-center gap-2"
                  fullWidth
                  disabled={buttonDisabled}
                >
                  <PlayIcon className="h-5 w-5" /> Watch Tutorial
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Dialog open={openDialog} handler={handleCloseDialog} size="xl">
        <DialogHeader className="text-lg font-semibold">
          {selectedTutorial?.title} Tutorial
        </DialogHeader>
        <DialogBody className="h-auto overflow-y-auto px-0">
          {selectedTutorial && (
            <div className="space-y-4">
              <div className="relative w-full overflow-hidden rounded-lg">
                <video
                  src={selectedTutorial.videoUrl}
                  controls
                  autoPlay
                  className="h-auto w-full rounded-md shadow"
                />
              </div>

              <div className="space-y-4 p-4">
                <div>
                  <Typography
                    variant="h6"
                    className="mb-2 text-blue-700"
                  >
                    Tutorial Notes:
                  </Typography>
                  <Typography className="text-gray-700">
                    {selectedTutorial.notes}
                  </Typography>
                </div>

                <div>
                  <Typography
                    variant="h6"
                    className="mb-2 text-blue-700"
                  >
                    Checklist:
                  </Typography>
                  <ul className="list-inside list-decimal space-y-1">
                    {selectedTutorial.checklist.map((item, index) => (
                      <li key={index} className="text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button onClick={handleCloseDialog} color="red">
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default AdminVideoTutorials;
