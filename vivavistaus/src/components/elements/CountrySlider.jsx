import React, { useState, useEffect, useRef } from "react";
import { Button } from "@material-tailwind/react";
import { IoIosArrowDropleft, IoIosArrowDropright } from "react-icons/io";
// import { FaLocationDot } from "react-icons/fa6";
import { FaStar, FaStarHalfAlt, FaRegStar, FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { generateDealSlug } from "../../utils/slugify";

// Helper function to format destination text with multicenter support
const formatDestinationText = (primaryDestination, additionalDestinations) => {
  if (!additionalDestinations || !additionalDestinations.length) return primaryDestination;
  
  // Get the name of the primary destination
  let result = primaryDestination;
  
  // Add the multicenter destinations with comma separator
  const multiDestinations = additionalDestinations.map(dest => dest.name).join(", ");
  
  if (multiDestinations) {
    // Combine with comma and limit overall length
    const combined = `${result}, ${multiDestinations}`;
    
    // If the combined string is too long, truncate it
    if (combined.length > 20) {
      return `${result}, ${multiDestinations.substring(0, 10)}...`;
    }
    return combined;
  }
  
  return result;
};

const TravelPackages = ({ destinations }) => {
  const navigate = useNavigate();
  const handleViewDeals = (deal) => {
    navigate(`/deals/${generateDealSlug(deal)}`); // ✅ Navigate to deal details page
  };

  const [scrollPositions, setScrollPositions] = useState(
    destinations.map(() => 0)
  );
  const [visibleCards, setVisibleCards] = useState(1);
  const [cardWidth, setCardWidth] = useState(320);
  const containerRefs = useRef([]);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const updateVisibleCards = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 1200) {
      setVisibleCards(1);
    } else if (screenWidth >= 900) {
      setVisibleCards(1);
    } else {
      setVisibleCards(1);
    }
  };

  useEffect(() => {
    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards);
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  const scrollLeftHandler = (index) => {
    setScrollPositions((prev) =>
      prev.map((pos, i) =>
        i === index ? Math.max(pos - cardWidth * visibleCards, 0) : pos
      )
    );
  };

  const scrollRightHandler = (index) => {
    const maxScroll =
      (destinations[index].deals.length - visibleCards) * cardWidth;

    setScrollPositions((prev) =>
      prev.map((pos, i) =>
        i === index ? Math.min(pos + cardWidth * visibleCards, maxScroll) : pos
      )
    );
  };

  const handleMouseDown = (index, e) => {
    isDragging.current = true;
    startX.current = e.pageX || e.touches[0].pageX;
    scrollLeft.current = scrollPositions[index];
  };

  const handleMouseMove = (index, e) => {
    if (!isDragging.current) return;
    const x = e.pageX || e.touches[0].pageX;
    const walk = startX.current - x;
    setScrollPositions((prev) =>
      prev.map((pos, i) =>
        i === index ? Math.max(scrollLeft.current + walk, 0) : pos
      )
    );
  };

  const handleMouseUp = (index) => {
    isDragging.current = false;
    setScrollPositions((prev) =>
      prev.map((pos, i) => {
        if (i === index) {
          const nearestCard = Math.round(pos / cardWidth) * cardWidth;
          return Math.min(
            Math.max(nearestCard, 0),
            (destinations[i].deals.length - visibleCards) * cardWidth
          );
        }
        return pos;
      })
    );
  };

  return (
    <div className="container mx-auto space-y-16 px-0 md:px-10 py-10 select-none">
      {destinations &&
        destinations.length > 0 &&
        destinations.map((destination, idx) => {
          // Use an if-statement to check if there are any deals; if not, return null
          if (!destination.deals || destination.deals.length === 0) return null;
          // Set a flex class based on whether the destination should be reversed
          const flexClass =
            "flex flex-col md:flex-row items-center justify-between gap-10" +
            (idx % 2 !== 0 ? " md:flex-row-reverse" : "");
          return (
            <div key={destination._id || idx} className={flexClass}>
              <div
                className="relative w-full h-24 md:w-1/3 aspect-square md:h-[340px] rounded-xl shadow-xl bg-cover bg-center"
                style={{ backgroundImage: `url(${destination.image})` }}
              >
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white rounded-full hover:scale-110 transition-transform"
                  onClick={() => scrollLeftHandler(idx)}
                >
                  <IoIosArrowDropleft className="w-6 h-6 md:w-12 md:h-12" />
                </button>
                <h2 className="absolute inset-0 flex items-center justify-center text-lg md:text-3xl font-bold text-white text-center pointer-events-none customfontstitle">
                  {/* {destination.name} */}
                  {destination.name.split(",")[0].trim()}
                </h2>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white rounded-full hover:scale-110 transition-transform"
                  onClick={() => scrollRightHandler(idx)}
                >
                  <IoIosArrowDropright className="w-6 h-6 md:w-12 md:h-12" />
                </button>
              </div>
              <div
                className="overflow-hidden w-full md:w-5/6 rounded-lg shadow-sm p-3 cursor-grab active:cursor-grabbing"
                ref={(el) => (containerRefs.current[idx] = el)}
                onMouseDown={(e) => handleMouseDown(idx, e)}
                onMouseMove={(e) => handleMouseMove(idx, e)}
                onMouseUp={() => handleMouseUp(idx)}
                onMouseLeave={() => handleMouseUp(idx)}
                onTouchStart={(e) => handleMouseDown(idx, e)}
                onTouchMove={(e) => handleMouseMove(idx, e)}
                onTouchEnd={() => handleMouseUp(idx)}
              >
                <div
                  className="flex gap-4 transition-transform ease-in-out"
                  style={{
                    transform: `translateX(-${scrollPositions[idx]}px)`,
                    width: `${cardWidth * (destination.deals.length + 1)}px`,
                    transition: isDragging.current
                      ? "none"
                      : "transform 0.5s ease-out",
                  }}
                >
                  {destination.deals.map((deal) => (
                    <div
                      key={deal._id}
                      className="bg-gradient-to-t from-[#0073b4] to-white rounded-2xl shadow-lg flex flex-col overflow-hidden transition-transform group relative"
                      style={{ width: `${cardWidth}px`, minHeight: "400px" }} // Ensures uniform card height
                    >
                      <img
                        src={deal.images[0]}
                        className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        alt={destination.name}
                        onClick={() => handleViewDeals(deal)}
                        style={{ cursor: 'pointer' }}
                      />
                      {/* Badge */}
                      {deal.tag && (
                        <div className="absolute top-3 left-3 bg-white text-deep-orange-500 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Tag size={14} /> {deal.tag}
                        </div>
                      )}
                      {/* Card Content */}
                      <div className="p-5 flex flex-col space-y-4 flex-grow">
                        {/* Price + Rating */}
                        <div className="flex place-items-end justify-between">
                          {/* Rating */}
                          <div className="flex flex-col items-start text-amber-300 space-y-1">
                            {deal.prices[0]?.hotel?.tripAdvisorRating ? (
                              <>
                                {/* Stars on top */}
                                <div className="flex gap-1">
                                  {Array.from({ length: 5 }, (_, i) => {
                                    const rating =
                                      deal.prices[0].hotel.tripAdvisorRating;
                                    if (i + 1 <= Math.floor(rating)) {
                                      return (
                                        <FaStar key={i} className="text-sm" />
                                      );
                                    } else if (i < rating) {
                                      return (
                                        <FaStarHalfAlt
                                          key={i}
                                          className="text-sm"
                                        />
                                      );
                                    } else {
                                      return (
                                        <FaRegStar
                                          key={i}
                                          className="text-sm text-gray-300"
                                        />
                                      );
                                    }
                                  })}
                                </div>
                                {/* Rating text below */}
                                <span className="text-white text-sm font-medium drop-shadow">
                                  {deal.prices[0].hotel.tripAdvisorRating.toFixed(
                                    1
                                  )}{" "}
                                  ({deal.prices[0].hotel.tripAdvisorReviews}{" "}
                                  Reviews)
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-100 text-sm italic drop-shadow">
                                No reviews yet
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <p className="text-white text-lg font-bold drop-shadow">
                            ${deal.prices[0]?.price || "N/A"}
                            <span className="text-sm font-normal text-gray-200 ml-1">
                              /Per Person
                            </span>
                          </p>
                        </div>

                        {/* Title */}
                        <p className="text-white text-xl font-semibold line-clamp-2 drop-shadow">
                          {deal.title}
                        </p>

                        {/* Basis */}
                        <p className="text-gray-100 text-sm font-medium flex items-center gap-2 drop-shadow">
                          <FaCircle size={7} /> {deal.boardBasis.name || "N/A"}
                        </p>

                        <hr className="border-gray-300" />

                        {/* Duration & Location */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white text-sm drop-shadow">
                            <CalendarDays size={18} />
                            <span>{deal.days || "N/A"} Nights</span>
                          </div>
                          <div className="flex items-center gap-2 text-white text-sm font-medium drop-shadow">
                            <MapPin size={18} />
                            <span className="truncate max-w-[8rem]" title={formatDestinationText(destination.name, deal.destinations)}>
                              {formatDestinationText(destination.name, deal.destinations)}
                            </span>
                          </div>
                        </div>

                        {/* Button */}
                        <Button
                          onClick={() => handleViewDeals(deal)}
                          className="w-full mt-2 bg-deep-orange-500 hover:bg-deep-orange-700 text-white font-medium text-lg rounded-md py-2 normal-case customfontstitle"
                        >
                          Discover More
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div style={{ width: `${cardWidth}px`, opacity: 0 }}></div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default TravelPackages;
