const express = require("express");
const route = express.Router();
const {
  sendContactMessage,
  sendGroupBookingInquiry,
  sendSubscribeMessage,
  sendBookingConfirmation,
  notifyAdminOfNewBooking,
} = require("../controllers/contactController");

route.post("/contactus", sendContactMessage);
route.post("/groupbookinginquiry", sendGroupBookingInquiry);
route.post("/send-subscribe-message", sendSubscribeMessage);
route.post("/send-booking-info", sendBookingConfirmation);
route.post("/notify-admin-booking", notifyAdminOfNewBooking);

module.exports = route;
