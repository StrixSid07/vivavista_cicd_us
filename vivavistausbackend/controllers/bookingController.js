const Booking = require("../models/Booking");
const Deal = require("../models/Deal");
const Airport = require("../models/Airport");
const mongoose = require("mongoose");
// ✅ Create a Booking (User or Guest)
// const createBooking = async (req, res) => {
//   try {
//     const {
//       dealId,
//       name,
//       email,
//       phone,
//       message,
//       selectedDate,
//       airport,
//       adults,
//       children = 0,
//     } = req.body;

//     // Convert selectedDate from DD/MM/YYYY to YYYY-MM-DD
//     const [day, month, year] = selectedDate.split("/");
//     const formattedDate = `${year}-${month}-${day}`;

//     // Validate the formatted date
//     const selectedDateObj = new Date(formattedDate);
//     if (isNaN(selectedDateObj.getTime())) {
//       return res.status(400).json({ message: "Invalid date provided" });
//     }

//     const selectedDateOnly = selectedDateObj.toISOString().split("T")[0];
//     const airportCode = airport.toUpperCase();

//     // Fetch the deal
//     const deal = await Deal.findById(dealId).populate("prices.hotel");
//     if (!deal) {
//       return res.status(404).json({ message: "Deal not found" });
//     }

//     // Find the matching price object based on airport and selected date
//     const matchedPrice = deal.prices.find((p) => {
//       const priceStart = new Date(p.startdate).toISOString().split("T")[0];
//       const priceEnd = new Date(p.enddate).toISOString().split("T")[0];
//       const priceAirport = p.airport.toUpperCase();

//       return (
//         priceAirport === airportCode &&
//         selectedDateOnly >= priceStart &&
//         selectedDateOnly <= priceEnd
//       );
//     });

//     if (!matchedPrice) {
//       return res.status(404).json({
//         message: "No available pricing for selected airport and date",
//       });
//     }

//     // Create booking with populated fields
//     const booking = new Booking({
//       dealId,
//       userId: req.user ? req.user.id : null,
//       name,
//       email,
//       phone,
//       message,
//       selectedDate: selectedDateObj,
//       returnDate: matchedPrice.enddate,
//       airport: airportCode,
//       adults,
//       children,
//       selectedHotel: matchedPrice.hotel,
//       selectedPrice: {
//         price: matchedPrice.price,
//         flightDetails: matchedPrice.flightDetails,
//       },
//     });

//     await booking.save();

//     res.status(201).json({ message: "Booking created successfully", booking });
//   } catch (error) {
//     console.error("Booking creation error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


const createBooking = async (req, res) => {
  try {
    const {
      dealId,
      name,
      email,
      phone,
      message,
      selectedDate,
      airport,
      adults,
      children = 0,
    } = req.body;
    console.log("this is data resived fromm backend", req.body);
    // Format date from "DD/MM/YYYY" to "YYYY-MM-DD"
    const [day, month, year] = selectedDate.split("/");
    const formattedDate = `${year}-${month}-${day}`;
    const selectedDateObj = new Date(formattedDate);

    if (isNaN(selectedDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid selected date format" });
    }

    const selectedDateOnly = selectedDateObj.toISOString().split("T")[0];
const airportr = await Airport.findById(airport);
    const airportCode = airportr.code;

    // Find deal and populate 'prices.hotel'
    const deal = await Deal.findById(dealId).populate("prices.hotel").populate("prices.airport");
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }
    // console.log("this is selcted date", selectedDateOnly);
    // console.log("this is airport:", airportCode);
    // Match correct pricing object
    const matchedPrice = deal.prices.find((price) => {
      const start = new Date(price.startdate).toISOString().split("T")[0];
      const end = new Date(price.enddate).toISOString().split("T")[0];
      // console.log("this is price ",price);
      const hasMatchingAirport = Array.isArray(price.airport)
  ? price.airport.some((a) => a.code?.toUpperCase() === airportCode)
  : price.airport?.code?.toUpperCase() === airportCode;

return (
  hasMatchingAirport &&
  selectedDateOnly >= start &&
  selectedDateOnly <= end
);
    });
    // console.log("matchprices", matchedPrice);
    if (!matchedPrice) {
      return res.status(404).json({
        message: "No pricing available for the selected date and airport",
      });
    }

    // Save new booking
    const booking = new Booking({
      dealId,
      userId: req.user ? req.user.id : null,
      name,
      email,
      phone,
      message,
      selectedDate: selectedDateObj,
      returnDate: matchedPrice.enddate,
      airport: airportCode,
      adults,
      children,
      selectedHotel: matchedPrice.hotel?._id || null,
      selectedPrice: {
        price: matchedPrice.price,
        flightDetails: matchedPrice.flightDetails,
      },
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Booking creation error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// ✅ Admin Create Booking
const createBookingByAdmin = async (req, res) => {
  try {
    const {
      dealId,
      name,
      email,
      phone,
      message,
      selectedDate,
      returnDate,
      airport,
      adults,
      children = 0,
      selectedPrice,
      selectedHotel,
      isManualEntry = false, // Check if this is a manual entry
    } = req.body;

    if (!dealId || !name || !email || !phone || !selectedDate || !airport) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Find the deal
    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ message: "Deal not found" });
    }

    // Parse dates
    const parseDate = (dateStr) => {
      if (!dateStr) return null;
      if (typeof dateStr === "string" && dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(dateStr);
    };

    // Only validate return date if not in manual mode or if it's provided
    const selectedDateObj = parseDate(selectedDate);
    let returnDateObj = null;
    
    if (returnDate) {
      returnDateObj = parseDate(returnDate);
      if (returnDateObj && isNaN(returnDateObj.getTime())) {
        return res.status(400).json({ message: "Invalid return date format" });
      }
    } else if (!isManualEntry) {
      // Only require return date in automatic mode
      return res.status(400).json({ message: "Return date is required in automatic mode" });
    }

    if (isNaN(selectedDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid selected date format" });
    }

    let finalSelectedPrice = null;
    let finalSelectedHotel = null;  // Default to null

    // Handle hotel data - regardless of mode
    // Check if selectedHotel is a string but not a valid ObjectId
    if (selectedHotel && typeof selectedHotel === 'string' && !mongoose.Types.ObjectId.isValid(selectedHotel)) {
      // If it's a string (like a hotel name), store it in price object
      // We'll create the finalSelectedPrice first if needed
      if (!selectedPrice) {
        finalSelectedPrice = { price: 0, hotel: selectedHotel };
      } else {
        finalSelectedPrice = { ...selectedPrice, hotel: selectedHotel };
      }
      // Leave finalSelectedHotel as null
    } else {
      // If it's a valid ObjectId or null, use it directly
      finalSelectedHotel = selectedHotel;
      finalSelectedPrice = selectedPrice || { price: 0 };
    }

    // For manual entries, we skip the price validation
    if (isManualEntry) {
      console.log("Manual entry detected, using provided price data");
    } else {
      // For automatic entries, check if we already have a valid selectedPrice from frontend
      if (!finalSelectedPrice.price) {
        // If we don't have a valid price, try to find it based on airport and date
        const dealPrice = deal.prices.find(
          (price) =>
            price.airport === airport.toUpperCase() &&
            new Date(price.startdate).toISOString().split("T")[0] === selectedDate
        );

        if (!dealPrice) {
          return res.status(400).json({
            message: "No price available for the selected date and airport",
          });
        }

        finalSelectedPrice = {
          ...finalSelectedPrice,
          price: dealPrice.price,
          flightDetails: dealPrice.flightDetails,
        };
      }
      
      // Handle hotel in automatic mode if not already set
      if (!finalSelectedHotel && !finalSelectedPrice.hotel) {
        const matchedPrice = deal.prices.find(p => 
          p.airport === airport.toUpperCase() && 
          new Date(p.startdate).toISOString().split("T")[0] === selectedDate
        );
        
        if (matchedPrice && matchedPrice.hotel) {
          finalSelectedHotel = matchedPrice.hotel;
        }
      }
      
      // Use dealPrice enddate as returnDate if not specified and in automatic mode
      if (!returnDateObj) {
        const matchedPrice = deal.prices.find(
          p => p.airport === airport.toUpperCase() && 
          new Date(p.startdate).toISOString().split("T")[0] === selectedDate
        );
        if (matchedPrice) {
          returnDateObj = new Date(matchedPrice.enddate);
        }
      }
    }

    // Create the booking
    const booking = new Booking({
      dealId,
      userId: req.user ? req.user.id : null,
      name,
      email,
      phone,
      message,
      selectedDate: selectedDateObj,
      returnDate: returnDateObj,
      airport: airport.toUpperCase(),
      adults,
      children,
      selectedHotel: finalSelectedHotel, // Use the hotel we determined
      selectedPrice: finalSelectedPrice, // Use the price we determined
    });

    await booking.save();

    res.status(201).json({
      message: "Booking created successfully by admin",
      booking,
    });
  } catch (error) {
    console.error("Admin booking creation error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Bookings for Logged-in User
const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id }).populate(
      "dealId",
      "title description"
    );
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Get All Bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("dealId", "title")
      .populate("selectedHotel", "name");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateBooking = async (req, res) => {
  try {
    const { id: bookingId } = req.params;
    const {
      dealId,
      name,
      email,
      phone,
      message,
      selectedDate,
      returnDate,
      airport,
      adults,
      children = 0,
      selectedHotel,
      selectedPrice,
      isManualEntry = false, // Add manual entry flag here too
    } = req.body;

    // Format selectedDate and returnDate if needed
    const formatDate = (dateStr) => {
      if (!dateStr) return null;
      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return new Date(`${year}-${month}-${day}`);
      }
      return new Date(dateStr);
    };

    // Process dates based on mode
    const formattedSelectedDate = formatDate(selectedDate);
    let formattedReturnDate = formatDate(returnDate);
    
    if (!formattedSelectedDate) {
      return res.status(400).json({ message: "Selected date is required" });
    }
    
    // In automatic mode, return date is required
    if (!isManualEntry && !formattedReturnDate) {
      return res.status(400).json({ message: "Return date is required in automatic mode" });
    }

    // Process the hotel data and price data
    let finalSelectedHotel = null;
    let finalSelectedPrice = selectedPrice || { price: 0 };
    
    // Handle hotel data - regardless of mode
    // Check if selectedHotel is a string but not a valid ObjectId
    if (selectedHotel && typeof selectedHotel === 'string' && !mongoose.Types.ObjectId.isValid(selectedHotel)) {
      // If it's a string (like a hotel name), store it in price object
      finalSelectedPrice = {
        ...finalSelectedPrice,
        hotel: selectedHotel
      };
      // Leave finalSelectedHotel as null
    } else {
      // If it's a valid ObjectId or null, use it directly
      finalSelectedHotel = selectedHotel;
    }

    // Validate the deal exists if this is being changed
    if (dealId && !isManualEntry && !finalSelectedPrice.price) {
      // Only need to validate if we don't already have a valid price from frontend
      const deal = await Deal.findById(dealId);
      if (!deal) {
        return res.status(404).json({ message: "Deal not found" });
      }
      
      // Only validate price availability if this is not a manual entry and we don't have a price
      if (selectedDate && airport) {
        const formattedDate = typeof selectedDate === 'string' ? 
          selectedDate.split('T')[0] : new Date(selectedDate).toISOString().split('T')[0];
          
        const dealPrice = deal.prices.find(
          (price) =>
            price.airport === airport.toUpperCase() &&
            new Date(price.startdate).toISOString().split("T")[0] === formattedDate
        );

        if (!dealPrice) {
          return res.status(400).json({
            message: "No price available for the selected date and airport",
          });
        }
        
        // If we found a matching price in the database, use it
        finalSelectedPrice = {
          ...finalSelectedPrice,
          price: dealPrice.price,
          flightDetails: dealPrice.flightDetails
        };
        
        // If hotel not set yet and we found a matching hotel in the database, use it
        if (!finalSelectedHotel && !finalSelectedPrice.hotel && dealPrice.hotel) {
          finalSelectedHotel = dealPrice.hotel;
        }
        
        // Use dealPrice enddate as returnDate if not specified and in automatic mode
        if (!formattedReturnDate) {
          formattedReturnDate = new Date(dealPrice.enddate);
        }
      }
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      {
        dealId,
        name,
        email,
        phone,
        message,
        selectedDate: formattedSelectedDate,
        returnDate: formattedReturnDate,
        airport: airport ? airport.toUpperCase() : undefined,
        adults,
        children,
        selectedHotel: finalSelectedHotel,
        selectedPrice: finalSelectedPrice,
      },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.status(200).json({
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("Booking update error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin: Update Booking Status
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.status = status;
    await booking.save();

    res.json({ message: "Booking status updated", booking });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Admin/User: Delete Booking by ID
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getDealsDropdown = async (req, res) => {
  try {
    const deals = await Deal.find({})
      .select("title prices") // Only fetch title and prices
      .populate("prices.hotel", "name") // Populate hotel name only
      .populate("prices.airport", "name code"); // Add airport name and code population

    // Format data for dropdown use
    const dropdownData = deals.map((deal) => ({
      id: deal._id,
      title: deal.title,
      prices: deal.prices.map((price) => ({
        airport: price.airport,
        startdate: price.startdate,
        enddate: price.enddate,
        price: price.price,
        hotel: price.hotel?.name || "N/A",
      })),
    }));

    res.json(dropdownData);
  } catch (error) {
    console.error("Error fetching deals for dropdown:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createBooking,
  createBookingByAdmin,
  getUserBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
  updateBooking,
  getDealsDropdown,
};
