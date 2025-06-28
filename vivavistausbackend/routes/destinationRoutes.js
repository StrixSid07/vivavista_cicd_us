const express = require("express");
const router = express.Router();
const {
  getDestinations,
  addDestination,
  getDestinationDropdown,
  updateDestination,
  deleteDestination,
  deleteDestinationImage,
  getFilterDealsByDestination,
  getDestinationPlaces,
  addPlaceToDestination,
  updatePlace,
  deletePlace
} = require("../controllers/destinationController");
const { upload, uploadToS3 } = require("../middleware/imageUpload");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/destinations", getDestinations);
router.get("/dropdown-destionation", getDestinationDropdown);
router.get("/destination-filter", getFilterDealsByDestination);
router.get("/:id/places", getDestinationPlaces);

// Protected routes
// router.post("/", protect, isAdmin, upload.single("images"), addDestination);
router.post("/",  upload.single("images"), addDestination);
router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("images"),
  updateDestination
); // 🔄 Update
router.delete("/:id", protect, isAdmin, deleteDestination); // 🗑️ Delete
router.delete(
  "/image/:destinationId",
  protect,
  isAdmin,
  deleteDestinationImage
);

// Places routes
router.post(
  "/:id/places",
  protect,
  isAdmin,
  addPlaceToDestination
);
router.put(
  "/:destinationId/places/:placeId",
  protect,
  isAdmin,
  updatePlace
);
router.delete(
  "/:destinationId/places/:placeId",
  protect,
  isAdmin,
  deletePlace
);

module.exports = router;
