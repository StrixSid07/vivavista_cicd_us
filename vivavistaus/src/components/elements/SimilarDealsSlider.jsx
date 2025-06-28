import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import DealCard from "./DealCard";
import { Base_Url } from "../../utils/Api";

// Helper function to format destination text with multicenter support
const formatDestinationText = (primaryDestination, additionalDestinations) => {
  if (!additionalDestinations || !additionalDestinations.length) return primaryDestination;
  
  // Get the name of the primary destination
  let result = primaryDestination;
  
  // Add the multicenter destinations with comma separator
  const multiDestinations = additionalDestinations.map(dest => dest.name).join(", ");
  
  if (multiDestinations) {
    // Combine with comma
    const combined = `${result}, ${multiDestinations}`;
    
    // If the combined string is too long, truncate it
    if (combined.length > 40) {
      return `${result}, ${multiDestinations.substring(0, 25)}...`;
    }
    return combined;
  }
  
  return result;
};

export default function SimilarDealsSlider({ destinationId, dealId }) {
  const [deals, setDeals] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState([]);
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSimilar() {
      try {
        const url = `${Base_Url}/trending/topdealsbydestinations/${destinationId}${
          dealId ? `/${dealId}` : ""
        }`;
        const { data } = await axios.get(url);
        setDeals(data);
        setCurrentImageIndex(Array(data.length).fill(0)); // ✅ update this here
      } catch (err) {
        console.error("Failed to load similar deals:", err);
      }
    }
    fetchSimilar();
  }, [destinationId, dealId]);

  const scroll = (direction = "left") => {
    if (!sliderRef.current) return;
    const distance = sliderRef.current.clientWidth * 1;
    sliderRef.current.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const nextImage = (index) => {
    setCurrentImageIndex((prev) => {
      const newIndex = [...prev];
      const images = deals[index]?.images || [];
      if (images.length === 0) return prev;
      newIndex[index] = (newIndex[index] + 1) % images.length;
      return newIndex;
    });
  };

  const prevImage = (index) => {
    setCurrentImageIndex((prev) => {
      const newIndex = [...prev];
      const images = deals[index]?.images || [];
      if (images.length === 0) return prev;
      newIndex[index] = (newIndex[index] - 1 + images.length) % images.length;
      return newIndex;
    });
  };

  return (
    <div className="relative flex justify-center items-center mx-auto">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-2 z-20 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
      >
        <FaArrowLeft />
      </button>
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-2 z-20 p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
      >
        <FaArrowRight />
      </button>

      {/* Deal Cards Slider */}
      <div
        ref={sliderRef}
        className="flex overflow-x-auto mx-auto space-x-2 md:space-x-4 px-2 md:px-12 md:py-12 py-12 scroll-smooth snap-x snap-mandatory bg-transparent scrollbar-hide"
      >
        {deals.map((deal, index) => (
          <div
            key={deal._id}
            className="snap-start flex-shrink-0"
            style={{ width: "25rem" }}
          >
            <DealCard
              id={deal._id}
              images={deal.images}
              name={deal.title}
              price={deal.prices[0]?.price}
              location={formatDestinationText(deal.destination?.name, deal.destinations)}
              packageDays={deal.days}
              rating={deal.prices[0]?.hotel?.tripAdvisorRating}
              reviews={deal.prices[0]?.hotel?.tripAdvisorReviews}
              basis={deal.boardBasis?.name}
              currentImage={currentImageIndex[index] || 0}
              nextImage={() => nextImage(index)}
              prevImage={() => prevImage(index)}
              tag={deal.tag}
              deal={deal}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
