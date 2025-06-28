const express = require("express");
const { protect, isAdmin } = require("../middleware/authMiddleware");
const {
  getDealsForPriceManagement,
  getDealPrices,
  createDealPrice,
  updateDealPrice,
  deleteDealPrice,
  getPriceFormData
} = require("../controllers/priceController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Prices
 *   description: Manage deal prices
 */

/**
 * @swagger
 * /api/prices/deals:
 *   get:
 *     summary: Get all deals with basic info for price management
 *     tags: [Prices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: search
 *         in: query
 *         schema:
 *           type: string
 *         description: Search deals by title or tag
 *     responses:
 *       200:
 *         description: Successfully retrieved deals for price management
 *       403:
 *         description: Admin access required
 */
router.get("/deals", protect, isAdmin, getDealsForPriceManagement);

/**
 * @swagger
 * /api/prices/deals/{dealId}:
 *   get:
 *     summary: Get all prices for a specific deal
 *     tags: [Prices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: dealId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     responses:
 *       200:
 *         description: Successfully retrieved deal prices
 *       404:
 *         description: Deal not found
 *       403:
 *         description: Admin access required
 */
router.get("/deals/:dealId", protect, isAdmin, getDealPrices);

/**
 * @swagger
 * /api/prices/deals/{dealId}:
 *   post:
 *     summary: Create a new price for a deal
 *     tags: [Prices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: dealId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country
 *               - startdate
 *               - enddate
 *               - price
 *               - airport
 *               - hotel
 *             properties:
 *               country:
 *                 type: string
 *                 example: "UK"
 *               startdate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               enddate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-08"
 *               price:
 *                 type: number
 *                 example: 1299
 *               airport:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60f5b7a2c8e4d123456789ab"]
 *               hotel:
 *                 type: string
 *                 example: "60f5b7a2c8e4d123456789cd"
 *               priceswitch:
 *                 type: boolean
 *                 example: false
 *               flightDetails:
 *                 type: object
 *     responses:
 *       201:
 *         description: Price created successfully
 *       400:
 *         description: Invalid input data
 *       403:
 *         description: Admin access required
 */
router.post("/deals/:dealId", protect, isAdmin, createDealPrice);

/**
 * @swagger
 * /api/prices/deals/{dealId}/{priceId}:
 *   put:
 *     summary: Update a specific price in a deal
 *     tags: [Prices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: dealId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *       - name: priceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Price ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country
 *               - startdate
 *               - enddate
 *               - price
 *               - airport
 *               - hotel
 *             properties:
 *               country:
 *                 type: string
 *                 example: "UK"
 *               startdate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-01"
 *               enddate:
 *                 type: string
 *                 format: date
 *                 example: "2024-06-08"
 *               price:
 *                 type: number
 *                 example: 1299
 *               airport:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["60f5b7a2c8e4d123456789ab"]
 *               hotel:
 *                 type: string
 *                 example: "60f5b7a2c8e4d123456789cd"
 *               priceswitch:
 *                 type: boolean
 *                 example: false
 *               flightDetails:
 *                 type: object
 *     responses:
 *       200:
 *         description: Price updated successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Deal or price not found
 *       403:
 *         description: Admin access required
 */
router.put("/deals/:dealId/:priceId", protect, isAdmin, updateDealPrice);

/**
 * @swagger
 * /api/prices/deals/{dealId}/{priceId}:
 *   delete:
 *     summary: Delete a specific price from a deal
 *     tags: [Prices]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: dealId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Deal ID
 *       - name: priceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Price ID
 *     responses:
 *       200:
 *         description: Price deleted successfully
 *       404:
 *         description: Deal or price not found
 *       403:
 *         description: Admin access required
 */
router.delete("/deals/:dealId/:priceId", protect, isAdmin, deleteDealPrice);

/**
 * @swagger
 * /api/prices/form-data:
 *   get:
 *     summary: Get dropdown data for price form (hotels, airports, countries)
 *     tags: [Prices]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved form data
 *       403:
 *         description: Admin access required
 */
router.get("/form-data", protect, isAdmin, getPriceFormData);

module.exports = router; 