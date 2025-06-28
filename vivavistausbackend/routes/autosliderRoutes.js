const express = require("express");
const router = express.Router();
const autosliderController = require("../controllers/autosliderController");
const { upload } = require("../middleware/imageUpload");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// Public routes (no authentication required)
router.get("/", autosliderController.getAllAutosliders);
router.get("/:id", autosliderController.getAutosliderById);

// Protected routes (admin only)
router.post(
  "/",
  protect,
  isAdmin,
  upload.single("images"),
  autosliderController.createAutoslider
);

// IMPORTANT: Put the more specific route BEFORE the generic /:id route
router.delete(
  "/image/:id",
  protect,
  isAdmin,
  autosliderController.deleteAutosliderImage
);

router.put(
  "/:id",
  protect,
  isAdmin,
  upload.single("images"),
  autosliderController.updateAutoslider
);

router.delete(
  "/:id", 
  protect, 
  isAdmin, 
  autosliderController.deleteAutoslider
);

module.exports = router; 