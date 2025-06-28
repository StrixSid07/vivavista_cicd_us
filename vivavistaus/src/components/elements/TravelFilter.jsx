import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import {
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
  Input,
  Checkbox,
  Typography,
  Card,
  CardBody,
} from "@material-tailwind/react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { Base_Url } from "../../utils/Api";
import { generateDealSlug } from "../../utils/slugify";

const hotelTypes = [
  "Beach Hotel",
  "City Hotel",
  "Luxury Hotel",
  "Romantic Hotel",
];
const ratingOptions = ["3", "4", "5"];

const TravelFilter = () => {
  const dealsContainerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(location.state || {}); // Get form data from state
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Open by default
  const [initialMargin, setInitialMargin] = useState(true);
  const [sidebarClosedOnce, setSidebarClosedOnce] = useState(false);
  const [boardBasisOptions, setBoardBasisOptions] = useState([]);
  const [holidaycatOptions, setHolidayCatOptions] = useState([]);

  // Track when sidebar is closed for the first time
  useEffect(() => {
    if (!sidebarOpen && !sidebarClosedOnce) {
      setInitialMargin(false); // remove mt-10
      setSidebarClosedOnce(true); // lock it forever
    }
  }, [sidebarOpen, sidebarClosedOnce]);

  const fetchDeals = async () => {
    try {
      // Construct query parameters based on formData, only include non-empty fields
      const params = {};
      if (formData.departure) params.airport = formData.departure;
      if (formData.destination) params.destination = formData.destination;
      if (formData.checkIn) {
        params.fromdate = new Date(formData.checkIn).toISOString();
      }
      if (formData.checkOut) {
        params.todate = new Date(formData.checkOut).toISOString();
      }
      if (formData.rooms) params.rooms = formData.rooms;
      if (formData.boardBasis?.length)
        params.boardBasis = formData.boardBasis.join(",");
      if (formData.holidayCategories?.length)
        params.holidayCategories = formData.holidayCategories.join(",");

      // Create query string
      const queryString = new URLSearchParams(params).toString();

      // Construct final API URL
      const apiUrl = queryString
        ? `${Base_Url}/deals/?${queryString}`
        : `${Base_Url}/deals`;

      // Call the API
      const response = await axios.get(apiUrl);
      setDeals(response.data);
    } catch (err) {
      console.error("Error fetching deals:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoardBasis = async () => {
    try {
      const response = await axios.get(
        `${Base_Url}/boardbasis/dropdown-boardbasis`
      );
      if (response.data) {
        setBoardBasisOptions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch board basis:", error);
    }
  };

  const fetchHolidayCat = async () => {
    try {
      const response = await axios.get(`${Base_Url}/holidays/dropdown-holiday`);
      if (response.data) {
        setHolidayCatOptions(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch holiday categories:", error);
    }
  };

  useEffect(() => {
    fetchDeals();
    fetchBoardBasis();
    fetchHolidayCat();
  }, []);

  const [filters, setFilters] = useState({
    price: 10000,
    boardBasis: [],
    hotelType: [],
    rating: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Filter Logic: includes search filtering on title & location
  const filteredDeals = deals.filter((deal) => {
    console.log(deal.boardBasis.name);
    console.log("this filter bordbasis", filters.boardBasis);
    const matchesPrice = deal.prices.some(
      (price) => price.price <= filters.price
    );
    const matchesBoard =
      filters.boardBasis.length === 0 ||
      filters.boardBasis.includes(deal.boardBasis.name);
    const matchesHotel =
      filters.hotelType.length === 0 ||
      filters.hotelType.includes(deal.hotels[0]?.type); // Assuming hotels is an array and we check the first hotel type
    const matchesRating =
      filters.rating === "" ||
      deal.hotels[0]?.tripAdvisorRating === parseInt(filters.rating); // Assuming hotels is an array and we check the first hotel rating
    const matchesSearch =
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (deal.destination &&
        deal.destination.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
      matchesPrice &&
      matchesBoard &&
      matchesHotel &&
      matchesRating &&
      matchesSearch
    );
  });

  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const currentDeals = filteredDeals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (key, value) => {
    if (key === "boardBasis" || key === "hotelType") {
      const currentFilters = filters[key];
      setFilters({
        ...filters,
        [key]: currentFilters.includes(value)
          ? currentFilters.filter((item) => item !== value)
          : [...currentFilters, value],
      });
    } else {
      // Just set the value directly without converting
      setFilters({ ...filters, [key]: value });
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      price: 899,
      boardBasis: [],
      hotelType: [],
      rating: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
    setFormData({});
    setDeals([]);
    setError(null);
    navigate("/search", { state: {} });
    setTimeout(function () {
      fetchDeals();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto relative bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Toggle Button positioned at the top-right of the card */}
        <Button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden absolute top-2 left-2 bg-green-500 text-white p-2 rounded-full z-30"
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </Button>

        {/* Overlay to close sidebar on mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-20 bg-black opacity-25 md:hidden"
          />
        )}

        <form
          className="flex flex-col md:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Sidebar Filters */}
          <div
            className={`${
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            } fixed top-0 right-0 z-30 w-3/4 h-full bg-gray-50 p-4 md:p-6 border-l transition-transform duration-300 md:relative md:translate-x-0 md:w-1/4`}
          >
            <Typography
              variant="h5"
              color="deep-orange"
              className="mb-4 text-black customfontstitle"
            >
              Filter Your Search
            </Typography>

            {/* Search Filter */}
            <div className="mb-4">
              <Input
                label="Search"
                color="green"
                icon={<FaSearch size={16} />}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full customfontstitle"
              />
            </div>

            {/* Price Filter */}
            <div className="mb-4">
              <Typography
                variant="paragraph"
                className="text-green-500 font-semibold mb-2 customfontstitle"
              >
                Price: £{filters.price}
              </Typography>
              <input
                type="range"
                min="129"
                max="10000"
                step="1"
                value={filters.price}
                onChange={(e) =>
                  handleFilterChange("price", parseInt(e.target.value, 10))
                }
                className="w-full accent-green-500"
              />
            </div>

            {/* Board Basis Filter */}
            <Typography
              variant="h6"
              className="text-black mb-2 customfontstitle"
            >
              Board Basis
            </Typography>
            <Menu placement="bottom-start">
              <MenuHandler>
                <Button
                  variant="gradient"
                  color="green"
                  className="w-full text-left"
                >
                  {formData.boardBasis?.length > 0
                    ? `${formData.boardBasis.length} board basis selected`
                    : "Select Board Basis"}
                </Button>
              </MenuHandler>
              <MenuList className="z-[100000] max-h-64 overflow-auto">
                {boardBasisOptions.map((option) => (
                  <MenuItem
                    key={option._id}
                    className="flex items-center gap-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Checkbox
                      color="green"
                      ripple={false}
                      containerProps={{ className: "p-0" }}
                      className="hover:before:content-none"
                      checked={formData.boardBasis?.includes(option._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const isChecked = e.target.checked;
                        const updatedBoardBasis = isChecked
                          ? [...(formData.boardBasis || []), option._id]
                          : (formData.boardBasis || []).filter(
                              (id) => id !== option._id
                            );

                        setFormData({
                          ...formData,
                          boardBasis: updatedBoardBasis,
                        });
                      }}
                    />
                    <span>{option.name}</span>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            {/* Holiday Categories Filter */}
            <Typography
              variant="h6"
              className="text-black mb-2 mt-4 customfontstitle"
            >
              Holiday Categories
            </Typography>
            <Menu placement="bottom-start">
              <MenuHandler>
                <Button
                  variant="gradient"
                  color="green"
                  className="w-full text-left"
                >
                  {formData.holidayCategories?.length > 0
                    ? `${formData.holidayCategories.length} holiday category(ies) selected`
                    : "Select Holiday Categories"}
                </Button>
              </MenuHandler>
              <MenuList className="z-[100000] max-h-64 overflow-auto">
                {holidaycatOptions.map((option) => (
                  <MenuItem
                    key={option._id}
                    className="flex items-center gap-2"
                    onClick={(e) => e.preventDefault()} // Prevent closing dropdown
                  >
                    <Checkbox
                      color="green"
                      ripple={false}
                      containerProps={{ className: "p-0" }}
                      className="hover:before:content-none"
                      checked={formData.holidayCategories?.includes(option._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const isChecked = e.target.checked;
                        const updatedCategories = isChecked
                          ? [...(formData.holidayCategories || []), option._id]
                          : (formData.holidayCategories || []).filter(
                              (id) => id !== option._id
                            );

                        setFormData({
                          ...formData,
                          holidayCategories: updatedCategories,
                        });
                      }}
                    />
                    <span>{option.name}</span>
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            {/* Rating Filter */}
            <Typography
              variant="h6"
              className="text-black mt-4 mb-2 customfontstitle"
            >
              Rating
            </Typography>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange("rating", e.target.value)}
              className="block w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Any Rating</option>
              {ratingOptions.map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Stars
                </option>
              ))}
            </select>

            <Button
              color="green"
              className="mt-4 w-full customfontstitle"
              onClick={handleResetFilters} // Reset filters and clear state
            >
              Reset Filters
            </Button>
          </div>

          {/* Travel Deals Section */}
          <div className="w-full md:w-3/4 p-4 md:p-6">
            <Typography
              variant="h4"
              className={`${
                initialMargin ? "mt-10" : "mt-0"
              } text-black mb-6 customfontstitle`}
            >
              Showing {filteredDeals.length} Results
            </Typography>
            <div
              ref={dealsContainerRef}
              className="max-h-[700px] overflow-y-auto"
            >
              <div className="grid grid-cols-1 gap-6">
                {currentDeals.map((item) => (
                  <Card
                    key={item._id}
                    className="shadow-md rounded-lg w-full md:w-[48rem] md:h-[16rem] flex flex-col md:flex-row overflow-hidden"
                  >
                    {/* Image Section */}
                    <div className="w-full md:w-2/5 h-48 md:h-full shrink-0 rounded-b-none md:rounded-r-none">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Text Section */}
                    <CardBody className="p-4 bg-gradient-to-b from-[#00AEEF]/90 to-white flex flex-col justify-center w-full md:w-96">
                      <Typography
                        variant="h6"
                        className="text-[#333333] customfontstitle"
                      >
                        {item.title}
                      </Typography>
                      <Typography className="text-black customfontstitle">
                        {item.destination?.name || "Unknown Destination"}
                        {item.prices[0]?.flightDetails?.outbound?.airline && (
                          <>
                            {" "}
                            - {
                              item.prices[0].flightDetails.outbound.airline
                            }{" "}
                            Airline
                          </>
                        )}
                      </Typography>
                    </CardBody>

                    {/* Price & Button Section */}
                    <div className="w-full md:w-1/5 flex flex-col bg-gray-100 justify-center items-center gap-2 p-3 md:p-4">
                      <Typography className="text-center font-semibold text-green-500 customfontstitle">
                        £{item.prices[0]?.price || "N/A"} per person
                      </Typography>
                      <Button
                        color="green"
                        size="sm"
                        className="customfontstitle"
                        onClick={() => navigate(`/deals/${generateDealSlug(item)}`)}
                      >
                        View Deal
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-6">
              <Button
                onClick={() => {
                  setCurrentPage(currentPage - 1);
                  if (dealsContainerRef.current) {
                    dealsContainerRef.current.scrollTop = 0; // Scroll inner deals container
                  }
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
                {currentPage} of {totalPages}
              </Typography>
              <Button
                onClick={() => {
                  setCurrentPage(currentPage + 1);
                  if (dealsContainerRef.current) {
                    dealsContainerRef.current.scrollTop = 0; // Scroll inner deals container
                  }
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default TravelFilter;
