const express = require("express");
const router = express.Router();
const multicenterController = require("../controllers/multicenterController");

// Get all multicenter deals with optional sorting
router.get("/", multicenterController.getAllMulticenterDeals);

// Get featured multicenter deals
router.get("/featured", multicenterController.getFeaturedMulticenterDeals);

// Get multicenter deals by destination
router.get("/destination/:destinationId", multicenterController.getMulticenterDealsByDestination);

module.exports = router; 