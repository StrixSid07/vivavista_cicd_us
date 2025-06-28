import React, { useState, useEffect } from "react";
import {
  FaPlaneDeparture,
  FaCalendarAlt,
  FaUserFriends,
  FaBed,
  FaPlus,
  FaMinus,
  FaSearch,
  FaMoon
} from "react-icons/fa";
import { HiOutlineLocationMarker } from "react-icons/hi";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Base_Url } from "../../utils/Api";

const SearchBar = ({ roomOptions }) => {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    departure: "",
    destination: "",
    nights: "2",
    rooms: 1,
    guests: 1,
  });

  // Nights options
  const nightsOptions = [
    { value: "2", label: "2 Nights" },
    { value: "3", label: "3 Nights" },
    { value: "4", label: "4 Nights" },
    { value: "5", label: "5 Nights" },
    { value: "6", label: "6 Nights" },
    { value: "7", label: "7 Nights" },
    { value: "8", label: "8 Nights" },
    { value: "9", label: "9 Nights" },
    { value: "10+", label: "10+ Nights" },
  ];

  // Fetch Airports and Destinations from API
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [airportRes, destinationRes] = await Promise.all([
          axios.get(`${Base_Url}/airport`),
          axios.get(`${Base_Url}/destinations/dropdown-destionation`),
        ]);

        setAirports(airportRes.data);
        setDestinations(destinationRes.data);
      } catch (err) {
        console.error("Error fetching dropdown data:", err);
        setError("Failed to load dropdown data");
      } finally {
        setLoading(false);
      }
    };

    fetchDropdownData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate("/search", { state: formData }); // Pass formData as state
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full md:w-fit bg-[#0073b4]/95 rounded-xl mx-auto -mt-28 md:-mt-16 shadow-lg flex flex-col md:flex-row items-stretch overflow-hidden customfontstitle"
    >
      {/* Departure Airport */}
      <div className="flex flex-col justify-center w-full md:w-48 border-b md:border-b-0 md:border-r border-black px-4 py-6">
        <label className="flex items-center gap-2 text-md text-white mb-2">
          <FaPlaneDeparture /> Departure
        </label>
        <select
          name="departure"
          value={formData.departure}
          onChange={handleChange}
          className="bg-white text-gray-800 border border-black rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          {airports.map((airport) => (
            <option key={airport._id} value={airport._id}>
              {airport.name}
            </option>
          ))}
        </select>
      </div>

      {/* Destination */}
      <div className="flex flex-col justify-center w-full md:w-48 border-b md:border-b-0 md:border-r border-black px-4 py-3">
        <label className="flex items-center gap-2 text-md text-white mb-2">
          <HiOutlineLocationMarker /> Destination
        </label>
        <select
          name="destination"
          value={formData.destination}
          onChange={handleChange}
          className="bg-white text-gray-800 border border-black rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select</option>
          {destinations.map((destination) => (
            <option key={destination._id} value={destination._id}>
              {destination.name}
            </option>
          ))}
        </select>
      </div>

      {/* Nights */}
      <div className="flex flex-col justify-center w-full md:w-48 border-b md:border-b-0 md:border-r border-black px-4 py-3">
        <label className="flex items-center gap-2 text-md text-white mb-2">
          <FaMoon /> Nights
        </label>
        <select
          name="nights"
          value={formData.nights}
          onChange={handleChange}
          className="bg-white text-gray-800 border border-black rounded-md px-3 py-2 text-sm w-full"
        >
          {nightsOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Rooms */}
      <div className="flex flex-col justify-center w-full md:w-40 border-b md:border-b-0 md:border-r border-black px-4 py-3">
        <label className="flex items-center gap-2 text-md text-white mb-2">
          <FaBed /> Rooms
        </label>
        <div className="flex items-center justify-between bg-white rounded-md px-3 py-2">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                rooms: Math.max(1, prev.rooms - 1),
              }))
            }
            className="text-gray-600 hover:text-black"
          >
            <FaMinus />
          </button>
          <span className="text-sm font-bold text-black">
            {formData.rooms || 1}
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                rooms: prev.rooms + 1,
              }))
            }
            className="text-gray-600 hover:text-black"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      {/* Guests */}
      <div className="flex flex-col justify-center w-full md:w-40 border-b md:border-b-0 md:border-r border-black px-4 py-3">
        <label className="flex items-center gap-2 text-md text-white mb-2">
          <FaUserFriends /> Guests
        </label>
        <div className="flex items-center justify-between bg-white rounded-md px-3 py-2">
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                guests: Math.max(1, prev.guests - 1),
              }))
            }
            className="text-gray-600 hover:text-black"
          >
            <FaMinus />
          </button>
          <span className="text-sm font-bold text-black">
            {formData.guests || 1}
          </span>
          <button
            type="button"
            onClick={() =>
              setFormData((prev) => ({
                ...prev,
                guests: prev.guests + 1,
              }))
            }
            className="text-gray-600 hover:text-black"
          >
            <FaPlus />
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="flex flex-col justify-center items-center w-full md:w-48 bg-deep-orange-500 hover:bg-deep-orange-700 text-white font-bold transition-all duration-300 px-4 py-3 cursor-pointer"
      >
        <div className="flex items-center gap-2 text-md">
          <FaSearch size={18} />
          <span>Search</span>
        </div>
      </button>
    </form>
  );
};

export default SearchBar;
