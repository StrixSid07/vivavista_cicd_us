import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCircle,
  FaPlaneDeparture,
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
import { Base_Url } from "../../utils/Api";
import { generateDealSlug } from "../../utils/slugify";
import { slugify } from "../../utils/slugify";
import { aboutus, destination } from "../../assets";

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

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = window.innerWidth < 768 ? 4 : 6;
  const navigate = useNavigate();
  const { name: slug } = useParams();

  useEffect(() => {
    axios
      .get(`${Base_Url}/destinations/dropdown-destionation`)
      .then(({ data }) => setDestinations(data))
      .catch((err) => console.error("Error fetching destination list:", err));
  }, []);

  const slugToName = useMemo(
    () =>
      destinations.reduce((map, { name }) => {
        map[slugify(name)] = name;
        return map;
      }, {}),
    [destinations]
  );

  useEffect(() => {
    const realName = slugToName[slug];
    if (!realName) return;

    const fetchDeals = async () => {
      setLoading(true);
      try {
        console.log(`Fetching deals for destination: ${realName}`);
        const response = await axios.get(
          `${Base_Url}/destinations/destination-filter`,
          { params: { name: realName } }
        );
        console.log("Destination deals response:", response.data);
        setDeals(response.data);
        setImageIndex(
          response.data.reduce((acc, deal) => ({ ...acc, [deal._id]: 0 }), {})
        );
      } catch (error) {
        console.error("Error fetching destination deals:", error);
        // Don't stop the component from rendering, just show empty deals
        setDeals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [slug, slugToName]);

  const handlePrevImage = (e, dealId, images) => {
    // Stop event propagation to prevent bubbling to parent elements
    e.stopPropagation();
    e.preventDefault();
    
    // Update image index immediately
    setImageIndex((prev) => ({
      ...prev,
      [dealId]: prev[dealId] === 0 ? images.length - 1 : prev[dealId] - 1,
    }));
  };

  const handleNextImage = (e, dealId, images) => {
    // Stop event propagation to prevent bubbling to parent elements
    e.stopPropagation();
    e.preventDefault();
    
    // Update image index immediately
    setImageIndex((prev) => ({
      ...prev,
      [dealId]: prev[dealId] === images.length - 1 ? 0 : prev[dealId] + 1,
    }));
  };

  const totalPages = Math.ceil(deals.length / itemsPerPage);
  const currentDeals = deals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Get the current destination name
  const destinationName = slugToName[slug] || "Destinations";

  return (
    <div>
      {" "}
      <section
        className="relative bg-cover bg-center h-40 flex items-center justify-center"
        style={{
          backgroundImage: `url(${destination})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-gray-600/40"></div>
        <div className="hero-content text-center relative z-10">
          <h1 className="text-5xl font-bold text-white">{destinationName}</h1>
        </div>
      </section>
      <div className="min-h-screen p-6 bg-gradient-to-t from-indigo-900 via-indigo-700 to-teal-500 animate-gradient-x">
        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
        ) : deals.length === 0 ? (
          <div className="text-center mt-16">
            <p className="text-2xl font-semibold text-white mb-4">
              No deals found
            </p>
            <p className="text-lg text-indigo-100">
              Looks like there are no deals available for this destination.
              <br />
              Please select a different destination to explore more options!
            </p>
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
                  transition={{ delay: index * 0.2 }}
                >
                  <Card className="shadow-lg rounded-lg overflow-hidden flex flex-col h-full">
                    <CardHeader floated={false} className="relative h-48">
                      <div className="relative w-full h-full">
                        <img
                          src={deal.images[imageIndex[deal._id]]}
                          alt={deal.title}
                          className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105 cursor-pointer"
                          loading="eager"
                          onLoad={(e) => e.target.classList.add('loaded')}
                          onClick={() => navigate(`/deals/${generateDealSlug(deal)}`)}
                        />
                        {/* Preload next and previous images */}
                        {deal.images.length > 1 && (
                          <div className="hidden">
                            <img 
                              src={deal.images[(imageIndex[deal._id] + 1) % deal.images.length]} 
                              alt="preload next" 
                              loading="eager"
                            />
                            <img 
                              src={deal.images[imageIndex[deal._id] === 0 ? deal.images.length - 1 : imageIndex[deal._id] - 1]} 
                              alt="preload prev"
                              loading="eager" 
                            />
                          </div>
                        )}
                        {deal.tag && (
                          <div className="absolute top-3 left-3 bg-white text-deep-orange-500 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Tag size={14} /> {deal.tag}
                          </div>
                        )}
                        {deal.images.length > 1 && (
                          <>
                            <button
                              onClick={(e) =>
                                handlePrevImage(e, deal._id, deal.images)
                              }
                              className="absolute left-0 bottom-0 -mb-5 -ml-1 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg hover:bg-opacity-75 z-10"
                            >
                              <IoIosArrowBack />
                            </button>
                            <button
                              onClick={(e) =>
                                handleNextImage(e, deal._id, deal.images)
                              }
                              className="absolute right-0 bottom-0 -mb-5 -mr-1 transform -translate-y-1/2 bg-black text-white p-2 rounded-lg hover:bg-opacity-75 z-10"
                            >
                              <IoIosArrowForward />
                            </button>
                          </>
                        )}
                      </div>
                    </CardHeader>

                    <CardBody className="flex-grow flex flex-col justify-between">
                      <div className="space-y-3">
                        <h2 className="text-xl font-bold text-indigo-800 flex items-center gap-2">
                          <FaPlaneDeparture className="text-indigo-600" />{" "}
                          {deal.title}
                        </h2>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">
                            {formatDestinationText(deal.destination?.name, deal.destinations)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDays className="w-4 h-4 text-indigo-500" />
                          <span>{deal.days} Nights</span>
                          {deal.boardBasis?.name && (
                            <>
                              <FaCircle className="w-1 h-1 text-gray-400" />
                              <span className="font-medium">
                                {deal.boardBasis.name}
                              </span>
                            </>
                          )}
                        </div>

                        <p className="text-lg font-bold text-gradient bg-gradient-to-r from-indigo-400 to-teal-500 bg-clip-text text-transparent">
                          Starting from ${deal.prices[0]?.price || "N/A"}
                        </p>
                      </div>
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
                        className="bg-deep-orange-600 text-white px-4 py-2 rounded-lg hover:bg-deep-orange-700 transition"
                      >
                        Book Now
                      </button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 10);
                }}
                disabled={currentPage === 1}
                color="blue"
                className="mx-1"
              >
                Prev
              </Button>
              <Typography className="flex items-center mx-2">
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 10);
                }}
                disabled={currentPage === totalPages}
                color="blue"
                className="mx-1"
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Destinations;
