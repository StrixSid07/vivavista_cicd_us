import React, { useState, useEffect } from "react";
import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";
import { Hotel, MapPin, Utensils, Bed } from "lucide-react";
import {
  Drawer,
  Button,
  Typography,
  IconButton,
} from "@material-tailwind/react";


const AccommodationCard = ({ hotel }) => {
  const rating = hotel.tripAdvisorRating;
  const reviews = hotel.tripAdvisorReviews;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  // Disable body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift
    } else {
      // Enable body scroll
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    // Cleanup function to ensure scroll is re-enabled
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [drawerOpen]);

  // Format all hotel images
  const formattedImages = hotel.images || [];
  const formattedTripAdvisorPhotos = hotel.tripAdvisorPhotos || [];

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i + 1 <= Math.floor(rating)) {
        stars.push(<FaStar key={i} className="text-amber-500 text-sm" />);
      } else if (i < rating) {
        stars.push(
          <FaStarHalfAlt key={i} className="text-amber-500 text-sm" />
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300 text-sm" />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-lg flex flex-col w-80 h-64 mr-4 shrink-0 customfontstitle">
      {/* Hotel Name */}
      <div className="flex items-center gap-3 mb-3">
        <Hotel className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-gray-800 truncate">
          {hotel.name || "Hotel Name"}
        </h2>
      </div>

      {/* Destination */}
      {hotel.destination?.name && (
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-red-500" />
          <p className="text-sm text-gray-600 truncate">
            {hotel.destination.name}
          </p>
        </div>
      )}

      {/* Board Basis */}
      {hotel.boardBasis?.name && (
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-4 h-4 text-green-500" />
          <p className="text-sm text-gray-600 truncate">
            {hotel.boardBasis.name}
          </p>
        </div>
      )}

      {/* Room Type */}
      {hotel.roomType && (
        <div className="flex items-center gap-2 mb-3">
          <Bed className="w-4 h-4 text-purple-500" />
          <p className="text-sm text-gray-600 truncate">
            {hotel.roomType}
          </p>
        </div>
      )}

      {/* Spacer to maintain card height */}
      <div className="flex-grow mb-4"></div>

      {/* Rating */}
      <div className="flex items-center gap-1 mb-4">
        {rating ? (
          <>
            {renderStars()}
            <span className="text-sm text-gray-700 ml-2 font-medium">
              {rating.toFixed(1)}{" "}
              <span className="text-gray-500">({reviews} reviews)</span>
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-500 italic">No reviews yet</span>
        )}
      </div>

      {/* Button */}
      <Button
        size="sm"
        onClick={openDrawer}
        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 customfontstitle mt-auto"
      >
        VIEW MORE
      </Button>

      {/* Drawer */}
      <Drawer
        placement="right"
        open={drawerOpen}
        onClose={closeDrawer}
        overlayProps={{
          className: "fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm",
          style: { zIndex: 999998 }
        }}
        className="p-5 pt-28"
        style={{ zIndex: 999999 }}
        size={1000}
        dismiss={{ outsidePress: true, escapeKey: true }}
        overlay={true}
      >
        <div className="overflow-y-auto h-full pr-2">
          <div className="mb-6 flex items-center justify-between">
            <Typography variant="h5" color="blue" className="customfontstitle">
              {hotel.name}
            </Typography>
            <IconButton variant="text" color="red" onClick={closeDrawer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </IconButton>
          </div>

          {/* About */}
          <Typography
            color="black"
            className="mb-4 pr-4 leading-relaxed customfontstitle"
          >
            {hotel.about || "No description available."}
          </Typography>

          {/* Destination */}
          {hotel.destination && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                Destination:
              </Typography>
              <Typography className="text-gray-900 text-sm font-medium">
                {hotel.destination.name}
              </Typography>
            </section>
          )}

          {/* Board Basis */}
          {hotel.boardBasis && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                Board Basis:
              </Typography>
              <Typography className="text-gray-900 text-sm font-medium">
                {hotel.boardBasis.name}
              </Typography>
            </section>
          )}

          {/* Room Type */}
          {hotel.roomType && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                Room Type:
              </Typography>
              <Typography className="text-gray-900 text-sm font-medium">
                {hotel.roomType}
              </Typography>
            </section>
          )}

          {/* Facilities */}
          {hotel.facilities?.length > 0 && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                Facilities:
              </Typography>
              <ul className="list-disc pl-6 text-gray-900 text-sm space-y-1">
                {hotel.facilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Room Facilities */}
          {hotel.roomfacilities?.length > 0 && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                Room Facilities:
              </Typography>
              <ul className="list-disc pl-6 text-gray-900 text-sm space-y-1">
                {hotel.roomfacilities.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Location */}
          {hotel.location && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                Location:
              </Typography>
              <Typography className="text-sm text-gray-900 customfontstitle">
                {hotel.location}
              </Typography>
            </section>
          )}

          {/* Booking Link */}
          {hotel.externalBookingLink && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                External Links:
              </Typography>
              <a
                href={hotel.externalBookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm hover:underline"
              >
                Visit Hotel Website
              </a>
            </section>
          )}

          {/* Images */}
          {(formattedImages.length > 0 ||
            formattedTripAdvisorPhotos.length > 0) && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-2 text-black customfontstitle"
              >
                Images:
              </Typography>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ...formattedImages,
                  ...formattedTripAdvisorPhotos,
                ].map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Hotel Image ${idx + 1}`}
                    className="rounded-lg w-full object-cover h-40"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Room Types */}
          {hotel.rooms?.length > 0 && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                Room Options:
              </Typography>
              <ul className="pl-6 list-disc text-sm text-gray-900 space-y-1">
                {hotel.rooms.map((room, idx) => (
                  <li key={idx}>
                    {room.numberofrooms} rooms for {room.guestCapacity} guest(s)
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Latest Reviews */}
          {hotel.tripAdvisorLatestReviews?.length > 0 && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-2 text-black customfontstitle"
              >
                Latest Reviews:
              </Typography>
              <ul className="space-y-3">
                {hotel.tripAdvisorLatestReviews.map((rev, i) => (
                  <li
                    key={i}
                    className="bg-gray-100 p-3 rounded-lg shadow-sm text-sm text-gray-700"
                  >
                    <p className="italic mb-1">"{rev.review}"</p>
                    <p className="text-amber-700 font-medium">
                      Rating: {rev.rating}/5
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* TripAdvisor Link */}
          {hotel.tripAdvisorLink && (
            <section className="mb-4">
              <Typography
                variant="h6"
                className="mb-1 text-black customfontstitle"
              >
                TripAdvisor:
              </Typography>
              <a
                href={hotel.tripAdvisorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 text-sm hover:underline"
              >
                View on TripAdvisor
              </a>
            </section>
          )}
        </div>
      </Drawer>
    </div>
  );
};

export default AccommodationCard;
