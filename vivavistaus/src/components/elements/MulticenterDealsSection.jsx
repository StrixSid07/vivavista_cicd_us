import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Tag, ArrowRight } from "lucide-react";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCircle,
} from "react-icons/fa";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { generateDealSlug } from "../../utils/slugify";


// Function to format destination text for display
const formatDestinationText = (primaryDestination, additionalDestinations) => {
  if (!additionalDestinations || additionalDestinations.length === 0) {
    return primaryDestination || "Unknown Location";
  }

  const destinations = additionalDestinations.map(dest => dest.name);
  
  // Combine primary destination with additional destinations
  const allDestinations = primaryDestination 
    ? [primaryDestination, ...destinations] 
    : destinations;
  
  // If we have multiple destinations, format them nicely
  if (allDestinations.length > 1) {
    // If there are many destinations, truncate the list
    if (allDestinations.length > 2) {
      return `${allDestinations[0]}, ${allDestinations[1]} +${allDestinations.length - 2}`;
    }
    // Just two destinations
    return allDestinations.join(" & ");
  }
  
  // Just one destination
  return allDestinations[0] || "Unknown Location";
};

const MulticenterCard = ({ deal, index, currentImage, nextImage, prevImage }) => {
  const navigate = useNavigate();
  

  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[400px] transform transition-transform hover:scale-[1.02] hover:shadow-xl"
    >
      {/* Card Image Section */}
      <div className="relative h-48 overflow-hidden">
        <div className="w-full h-full overflow-hidden">
          <motion.img
            key={currentImage}
            src={deal.images[currentImage]}
            alt={deal.title}
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 cursor-pointer"
            onClick={() => navigate(`/deals/${generateDealSlug(deal)}`)}
          />
        </div>
        
        {/* Deal tag badge */}
        {deal.tag && (
          <div className="absolute top-3 left-3 bg-white text-amber-500 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Tag size={14} /> {deal.tag}
          </div>
        )}
        
        {/* Multicenter badge */}
        {deal.destinations && deal.destinations.length > 0 && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
            Multicenter
          </div>
        )}
        
        {/* Image navigation */}
        {deal.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 bottom-2 bg-black/50 hover:bg-black p-2 rounded-full"
            >
              <MdOutlineArrowBackIos className="text-white text-sm" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 bottom-2 bg-black/50 hover:bg-black p-2 rounded-full"
            >
              <MdOutlineArrowForwardIos className="text-white text-sm" />
            </button>
          </>
        )}
      </div>
      
      {/* Card Content */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{deal.title}</h3>
        
        {/* Destinations */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 text-amber-500" />
          <span className="font-medium text-amber-700 line-clamp-1" title={formatDestinationText(deal.destination?.name, deal.destinations)}>
            {formatDestinationText(deal.destination?.name, deal.destinations)}
          </span>
        </div>
        
        {/* Nights + Board Basis */}
        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <div className="flex items-center gap-1">
            <CalendarDays className="w-4 h-4 text-amber-500" />
            <span>{deal.days} Nights</span>
          </div>
          {deal.boardBasis?.name && (
            <div className="flex items-center gap-1">
              <FaCircle className="w-1 h-1 text-amber-400" />
              <span className="font-medium">{deal.boardBasis.name}</span>
            </div>
          )}
        </div>
        
        {/* Price + Rating */}
        <div className="mt-auto">
          {/* Rating */}
          <div className="flex items-center gap-1 text-amber-400 mb-2">
            {deal.prices[0]?.hotel?.tripAdvisorRating ? (
              <>
                {Array.from({ length: 5 }, (_, i) => {
                  const rating = deal.prices[0].hotel.tripAdvisorRating;
                  if (i + 1 <= Math.floor(rating)) {
                    return <FaStar key={i} className="text-sm" />;
                  } else if (i < rating) {
                    return <FaStarHalfAlt key={i} className="text-sm" />;
                  } else {
                    return <FaRegStar key={i} className="text-sm text-gray-300" />;
                  }
                })}
                <span className="text-gray-600 text-xs">
                  ({deal.prices[0].hotel.tripAdvisorReviews})
                </span>
              </>
            ) : (
              <span className="text-gray-500 text-xs italic">No reviews yet</span>
            )}
          </div>
          
          {/* Price + Button */}
          <div className="flex justify-between items-center">
            <div className="text-amber-600 font-bold">
              ${deal.prices[0]?.price || "N/A"}
              <span className="text-xs font-normal text-gray-500 ml-1">/per person</span>
            </div>
            <button
              onClick={() => navigate(`/deals/${generateDealSlug(deal)}`)}
              className="bg-amber-500 hover:bg-amber-600 text-white text-sm py-1 px-3 rounded-full flex items-center gap-1 transition-colors"
            >
              View <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const MulticenterDealsSection = ({ deals = [] }) => {
  const navigate = useNavigate();
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  
  useEffect(() => {
    // Initialize image indices for each deal
    const indices = deals.reduce((acc, deal) => {
      acc[deal._id] = 0;
      return acc;
    }, {});
    setCurrentImageIndices(indices);
  }, [deals]);
  
  const handleNextImage = (dealId) => {
    setCurrentImageIndices(prev => {
      const deal = deals.find(d => d._id === dealId);
      if (!deal) return prev;
      
      return {
        ...prev,
        [dealId]: (prev[dealId] + 1) % deal.images.length
      };
    });
  };
  
  const handlePrevImage = (dealId) => {
    setCurrentImageIndices(prev => {
      const deal = deals.find(d => d._id === dealId);
      if (!deal) return prev;
      
      const newIndex = (prev[dealId] - 1 + deal.images.length) % deal.images.length;
      return {
        ...prev,
        [dealId]: newIndex
      };
    });
  };
  
  if (!deals.length) {
    return null; // Don't render if no deals
  }
  
  return (
    <div className="bg-gradient-to-b from-white to-amber-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-4xl font-bold text-amber-800 mb-2 customfontstitle">Explore Multiple Destinations</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Experience the joy of visiting multiple beautiful destinations in a single trip with our specially curated multicenter packages</p>
        </div>
        
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.slice(0, 6).map((deal, index) => (
            <MulticenterCard
              key={deal._id}
              deal={deal}
              index={index}
              currentImage={currentImageIndices[deal._id] || 0}
              nextImage={() => handleNextImage(deal._id)}
              prevImage={() => handlePrevImage(deal._id)}
            />
          ))}
        </div>
        
        {/* View More Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/multicenter')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2 mx-auto transition-colors mb-2"
          >
            View All Multicenter Deals <ArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MulticenterDealsSection; 