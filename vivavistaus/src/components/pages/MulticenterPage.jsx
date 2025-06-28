import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import axios from "axios";
import { Base_Url } from "../../utils/Api";
import { generateDealSlug } from "../../utils/slugify";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCircle,
  FaPlaneDeparture,
  FaSort,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import {
  Card,
  Button,
  Typography,
  CardBody,
  CardHeader,
  CardFooter,
} from "@material-tailwind/react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { topdeals } from "../../assets"; // Reuse the same background image

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

const MulticenterPage = () => {
  const navigate = useNavigate();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState({});
  const [sortOption, setSortOption] = useState("updated");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = window.innerWidth < 768 ? 4 : 9; // 4 for mobile, 9 for desktop
  
  useEffect(() => {
    const fetchMulticenterDeals = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${Base_Url}/multicenter?sort=${sortOption}`);
        setDeals(response.data);
        setImageIndex(
          response.data.reduce((acc, deal) => ({ ...acc, [deal._id]: 0 }), {})
        );
      } catch (error) {
        console.error("Error fetching multicenter deals:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMulticenterDeals();
  }, [sortOption]);
  
  const handlePrevImage = (dealId, images) => {
    setImageIndex((prev) => ({
      ...prev,
      [dealId]: prev[dealId] === 0 ? images.length - 1 : prev[dealId] - 1,
    }));
  };

  const handleNextImage = (dealId, images) => {
    setImageIndex((prev) => ({
      ...prev,
      [dealId]: prev[dealId] === images.length - 1 ? 0 : prev[dealId] + 1,
    }));
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(deals.length / itemsPerPage);
  // Slice deals for the current page
  const currentDeals = deals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Sorting options
  const sortOptions = [
    { value: "updated", label: "Recently Updated", icon: <FaSort /> },
    { value: "created", label: "Newly Added", icon: <FaSortAmountDown /> },
    { value: "price-low", label: "Price: Low to High", icon: <FaSortAmountUp /> },
    { value: "price-high", label: "Price: High to Low", icon: <FaSortAmountDown /> },
  ];
  
  return (
    <div>
      <Helmet>
        <title>Multicenter Vacation Packages | Viva Vista Vacations</title>
        <meta 
          name="description" 
          content="Explore our multicenter vacation packages. Visit multiple destinations in a single trip with Viva Vista Vacations." 
        />
      </Helmet>
      
      {/* Header Section */}
      <section
        className="relative bg-cover bg-center h-40 flex items-center justify-center"
        style={{
          backgroundImage: `url(${topdeals})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-gray-600/40"></div>
        <div className="hero-content text-center relative z-10">
          <h1 className="text-5xl font-bold text-white">Multicenter Packages</h1>
        </div>
      </section>
      
      {/* Sorting Controls */}
      <div className="bg-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            {deals.length} Multicenter Packages
          </h2>
          
          <div className="relative">
            <button 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
            >
              {sortOptions.find(option => option.value === sortOption)?.icon}
              <span>Sort: {sortOptions.find(option => option.value === sortOption)?.label}</span>
            </button>
            
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                {sortOptions.map(option => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 ${
                      sortOption === option.value ? 'bg-amber-50 text-amber-600' : ''
                    }`}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Deals Grid */}
      <div className="min-h-screen p-6 bg-gradient-to-t from-blue-900 via-blue-700 to-green-500 animate-gradient-x">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-medium text-white">No multicenter deals available</h3>
            <p className="mt-2 text-gray-200">Please check back later or try different filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentDeals.map((deal, index) => (
                <motion.div
                  key={deal._id}
                  className="group transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
                    <CardHeader
                      color="blue-gray"
                      floated={false}
                      className="relative h-48 overflow-hidden"
                    >
                      <div className="relative w-full h-full">
                        <img
                          src={deal.images[imageIndex[deal._id]]}
                          alt={deal.title}
                          className="w-full h-full object-cover transition-transform duration-500 ease-in group-hover:scale-105 cursor-pointer"
                          onClick={() => navigate(`/deals/${generateDealSlug(deal)}`)}
                        />
                        
                        {/* Badge */}
                        {deal.tag && (
                          <div className="absolute top-3 left-3 bg-white text-deep-orange-500 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Tag size={14} /> {deal.tag}
                          </div>
                        )}
                        
                        {/* Multicenter badge */}
                        {deal.destinations && deal.destinations.length > 0 && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            Multicenter
                          </div>
                        )}
                        
                        {deal.images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                handlePrevImage(deal._id, deal.images)
                              }
                              className="absolute left-0 bottom-0 -mb-5 -ml-1 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg hover:bg-opacity-75"
                            >
                              <IoIosArrowBack />
                            </button>
                            <button
                              onClick={() =>
                                handleNextImage(deal._id, deal.images)
                              }
                              className="absolute right-0 bottom-0 -mb-5 -mr-1 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg hover:bg-opacity-75"
                            >
                              <IoIosArrowForward />
                            </button>
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardBody className="flex-grow flex flex-col justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-[#0073b4] flex items-center gap-2">
                          <FaPlaneDeparture /> {deal.title}
                        </h2>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">
                            {formatDestinationText(deal.destination?.name, deal.destinations)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDays className="w-4 h-4 text-indigo-500" />
                          <span>{deal.days} Nights</span>
                        </div>

                        {deal.boardBasis?.name && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <FaCircle className="w-1 h-1 text-gray-400" />
                            <span className="font-medium">
                              {deal.boardBasis?.name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-deep-orange-600 font-bold mt-2">
                        Starting from: ${deal.prices[0]?.price || "N/A"}
                      </p>
                    </CardBody>

                    <CardFooter className="flex justify-between items-center p-4 border-t mt-auto">
                      <div className="flex flex-col items-start text-amber-300 space-y-1">
                        {deal.prices[0]?.hotel?.tripAdvisorRating ? (
                          <>
                            <div className="flex gap-1">
                              {Array.from({ length: 5 }, (_, i) => {
                                const rating =
                                  deal.prices[0].hotel.tripAdvisorRating;
                                if (i + 1 <= Math.floor(rating)) {
                                  return <FaStar key={i} className="text-sm" />;
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
                            <span className="text-black text-sm font-medium drop-shadow">
                              {deal.prices[0].hotel.tripAdvisorRating.toFixed(
                                1
                              )}{" "}
                              ({deal.prices[0].hotel.tripAdvisorReviews}{" "}
                              Reviews)
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-900 text-sm italic drop-shadow">
                            No reviews yet
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => navigate(`/deals/${generateDealSlug(deal)}`)}
                        className="bg-[#1abc9c] hover:bg-teal-600 text-white py-2 px-4 rounded-lg transition-colors duration-300"
                      >
                        View Deal
                      </button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-300 text-gray-600"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === i + 1
                          ? "bg-blue-700 text-white"
                          : "bg-blue-500 text-white hover:bg-blue-600"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-300 text-gray-600"
                        : "bg-blue-500 text-white hover:bg-blue-600"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MulticenterPage; 