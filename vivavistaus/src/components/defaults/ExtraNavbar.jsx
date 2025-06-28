import React, { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaChevronDown,
} from "react-icons/fa";
import { PiXLogoFill } from "react-icons/pi";
import { motion } from "framer-motion";

const flagUrls = {
  UK: "https://flagcdn.com/gb.svg", // United Kingdom flag
  USA: "https://flagcdn.com/us.svg", // Usa flag
  Canada: "https://flagcdn.com/ca.svg", // Canada flag
};

const ExtraNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [region, setRegion] = useState("Canada"); // Default to Canada

  return (
    <header className="bg-[#0073b4] text-white py-1 text-base">
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* Left Side - Contact Info */}
        <div className="flex items-center space-x-6 sm:space-x-4">
          <a
            href="tel:+18000000000"
            className="flex items-center space-x-2 transition-colors duration-300 ease-in-out hover:text-deep-orange-700 text-lg"
          >
            <FaPhoneAlt />
            <span className="hidden sm:inline">{region === "USA" ? "1 8** *** ****" : region === "Canada" ? "1 8** *** ****" : "0203 780 5023"}</span>
          </a>
          <a
            href="mailto:admin@vivavistavacations.ca"
            className="flex items-center space-x-2 transition-colors duration-300 ease-in-out hover:text-deep-orange-700 text-lg"
          >
            <FaEnvelope />
            <span className="hidden sm:inline">
              admin@vivavistavacations.ca
            </span>
          </a>
        </div>

        {/* Center - Social Icons (Hidden on Small Screens) */}
        <div className="hidden sm:flex items-center space-x-4">
          <a
            href="#"
            className="text-white transition-colors duration-300 ease-in-out hover:text-orange-600"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="#"
            className="text-white transition-colors duration-300 ease-in-out hover:text-orange-600"
          >
            <FaFacebookF size={20} />
          </a>
          <a
            href="#"
            className="text-white transition-colors duration-300 ease-in-out hover:text-orange-600"
          >
            <PiXLogoFill size={20} />
          </a>
          <a
            href="#"
            className="text-white transition-colors duration-300 ease-in-out hover:text-orange-600"
          >
            <FaWhatsapp size={20} />
          </a>
        </div>

        {/* Right Side - Region Selector with Flag */}
        <div className="relative">
          <button
            className="cursor-pointer flex items-center space-x-2 text-lg font-medium hover:text-black transition-colors duration-300 ease-in-out"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* Display the flag icon */}
            <img
              src={flagUrls[region]}
              alt={`${region} flag`}
              className="w-5 h-5 object-cover"
            />
            <span>{region}</span>
            <motion.div
              animate={{ rotate: isDropdownOpen ? 180 : 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <FaChevronDown />
            </motion.div>
          </button>

          {isDropdownOpen && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute right-0 mt-2 w-36 bg-white text-black rounded-lg shadow-lg overflow-hidden border"
            >
              {["Canada", "USA", "UK"].map((item) => (
                <li
                  key={item}
                  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 text-[#D35400] font-semibold cursor-pointer transition-all duration-200"
                  onClick={() => {
                    setRegion(item);
                    setIsDropdownOpen(false);
                  }}
                >
                  <img
                    src={flagUrls[item]}
                    alt={`${item} flag`}
                    className="w-5 h-5 object-cover"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default ExtraNavbar;
