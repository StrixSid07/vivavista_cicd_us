import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
import { packages } from "../../assets";

const Packages = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageIndex, setImageIndex] = useState({});
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = window.innerWidth < 768 ? 4 : 6; // 4 for mobile, 6 for desktop

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await axios.get(`${Base_Url}/deals`);
        setDeals(response.data);
        setImageIndex(
          response.data.reduce((acc, deal) => ({ ...acc, [deal._id]: 0 }), {})
        );
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

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

  return (
    <div>
      {" "}
      <section
        className="relative bg-cover bg-center h-40 flex items-center justify-center"
        style={{
          backgroundImage: `url(${packages})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-gray-600/40"></div>
        <div className="hero-content text-center relative z-10">
          <h1 className="text-5xl font-bold text-white">Packages</h1>
        </div>
      </section>
      <div className="min-h-screen p-6 bg-gradient-to-t from-blue-900 via-blue-700 to-green-500 animate-gradient-x">
        {loading ? (
          <p className="text-center text-gray-300">Loading...</p>
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
                        <p className="text-gray-700 mt-2 line-clamp-3">
                          {deal.description}
                        </p>
                      </div>
                      <div className="flex justify-between items-start mt-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">
                            {deal.destination?.name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <CalendarDays className="w-4 h-4 text-indigo-500" />
                          <span>{deal.days} Nights</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          {deal.boardBasis?.name && (
                            <>
                              <FaCircle className="w-1 h-1 text-gray-400" />
                              <span className="font-medium">
                                {deal.boardBasis?.name}
                              </span>
                            </>
                          )}
                        </div>
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
                  // window.scrollTo(0, 0); // Scroll to top
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 10);
                }}
                disabled={currentPage === 1}
                color="green"
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
                  // window.scrollTo(0, 0); // Scroll to top
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }, 10);
                }}
                disabled={currentPage === totalPages}
                color="green"
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

export default Packages;
