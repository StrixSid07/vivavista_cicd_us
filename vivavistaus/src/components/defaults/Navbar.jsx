import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaBars,
  FaTimes,
  FaChevronDown,
  FaPhoneAlt,
  FaChevronRight,
  FaEnvelope,
  FaHome,
} from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { Link, useLocation } from "react-router-dom";
import { navbarStyles } from "../../styles/styles";
import { logo, home, packageImg, hot, beach, earth } from "../../assets";
import axios from "axios";
import { Base_Url } from "../../utils/Api";
import { slugify, slugifyholiday } from "../../utils/slugify";

const sidebarVariants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 18,
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const Navbar = () => {
  const [holidayCategories, setHolidayCategories] = useState([]);
  const [destinationCategories, setDestinationCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${Base_Url}/holidays/dropdown-holiday`)
      .then(({ data }) => setHolidayCategories(data))
      .catch((err) => console.error("Error fetching vacation categories:", err));
    axios
      .get(`${Base_Url}/destinations/dropdown-destionation`)
      .then(({ data }) => setDestinationCategories(data))
      .catch((err) =>
        console.error("Error fetching destination categories:", err)
      );
  }, []);

  const navItems = [
    // { name: "Home", href: "/", icon: home },
    { name: "Travel Bundle", href: "/packages", icon: packageImg },
    { name: "Hot Bargains", href: "/topdeals", icon: hot },
    {
      name: "Vacations",
      href: "#",
      icon: beach,
      dropdown: holidayCategories.map(({ name }) => ({
        name,
        // href: `/${name}`,
        href: `/vacations/${slugifyholiday(name)}`,
      })),
    },
    {
      name: "Destinations",
      href: "#",
      icon: earth,
      dropdown: destinationCategories.map(({ name }) => ({
        name,
        href: `/destinations/${slugify(name)}`,
      })),
    },
    // { name: "Multicenter", href: "/multicenter", icon: earth },
  ];

  const navItemsForMobile = [
    // { name: "Home", href: "/" },
    { name: "Travel Bundle", href: "/packages" },
    { name: "Hot Bargains", href: "/topdeals" },
    {
      name: "Vacations",
      href: "#",
      icon: beach,
      dropdown: holidayCategories.map(({ name }) => ({
        name,
        // href: `/${name}`,
        href: `/vacations/${slugify(name)}`,
      })),
    },
    {
      name: "Destinations",
      href: "#",
      icon: earth,
      dropdown: destinationCategories.map(({ name }) => ({
        name,
        href: `/destinations/${slugify(name)}`,
      })),
    },
    // { name: "Multicenter", href: "/multicenter" },
  ];

  const flagUrls = {
    UK: "https://flagcdn.com/gb.svg", // United Kingdom flag
    USA: "https://flagcdn.com/us.svg", // Usa flag
    Canada: "https://flagcdn.com/ca.svg", // Canada flag
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [region, setRegion] = useState("Canada"); // Changed default from UK to Canada

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dropdownStates, setDropdownStates] = useState({});
  const isMobileOrTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  const location = useLocation();
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // const toggleDropdown = (index) => {
  //   setDropdownStates((prevState) => ({
  //     ...prevState,
  //     [index]: !prevState[index],
  //   }));
  // };

  const toggleDropdown = (index) => {
    setDropdownStates((prevState) => {
      const newState = {};
      newState[index] = !prevState[index]; // toggle clicked one
      return newState;
    });
  };

  // Update dropdown states on hover
  const handleMouseEnter = (index) => {
    setDropdownStates((prevState) => ({
      ...prevState,
      [index]: true,
    }));
  };

  const handleMouseLeave = (index, e) => {
    if (e.currentTarget.contains(e.relatedTarget)) {
      return; // Still inside the dropdown container, so do nothing.
    }
    setDropdownStates((prevState) => ({
      ...prevState,
      [index]: false,
    }));
  };

  const closeAllDropdowns = () => {
    setDropdownStates({});
  };

  useEffect(() => {
    if (!isSidebarOpen) {
      closeAllDropdowns();
    }
  }, [isSidebarOpen]);

  // Optional: function to check if any dropdown item is active based on location.
  const isDropdownActive = (dropdown) => {
    return dropdown.some((subItem) => location.pathname === subItem.href);
  };

  // Close sidebar when clicking outside (for mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeSidebar();
      }
    };

    if (isSidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <header className={navbarStyles.backgroundColor}>
      {isMobileOrTablet ? (
        // Mobile version: uses click to toggle sidebar
        <nav className={`${navbarStyles.backgroundColor} font-medium`}>
          <div className="container mx-auto flex justify-between items-center p-4">
            <Link to="/">
              {" "}
              <img src={logo} alt="VivaVistaFe" className="h-16 select-none" />
            </Link>
            <div className="relative bg-[#0073b4] rounded-xl p-2">
              <button
                className="cursor-pointer flex items-center space-x-2 text-lg font-medium text-white hover:text-black transition-colors duration-500 ease-in-out"
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
                  {["Canada", "USA", "UK"].map((item) => {
                                          const urls = {
                      UK: "https://www.vivavistavacations.co.uk/",
                      USA: "https://www.vivavistavacations.com/",
                      Canada: "https://www.vivavistavacations.ca/",
                    };

                    return (
                      <li
                        key={item}
                        className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 text-[#D35400] font-semibold cursor-pointer transition-all duration-200"
                        onClick={() => {
                          setRegion(item);
                          setIsDropdownOpen(false);
                          window.open(urls[item], '_blank'); // ⬅️ Open in new tab
                        }}
                      >
                        <img
                          src={flagUrls[item]}
                          alt={`${item} flag`}
                          className="w-5 h-5 object-cover"
                        />
                        <span>{item}</span>
                      </li>
                    );
                  })}
                </motion.ul>
              )}
            </div>
            <a
              href="tel:+18000000000"
              className="flex items-center p-2 group bg-green-500 text-white rounded-xl hover:bg-teal-500 space-x-2 transition-colors duration-300 ease-in-out hover:text-orange-500 text-lg "
            >
              <div className="p-1 bg-white rounded-full text-orange-500 transition-colors duration-300 ease-in-out group-hover:text-blue-500">
                <FaPhoneAlt />
              </div>
              <span className="hidden sm:inline">1 8** *** ****</span>
            </a>
            <motion.div
              onClick={toggleSidebar}
              whileTap={{ scale: 0.9 }}
              className="cursor-pointer"
            >
              {isSidebarOpen ? (
                <FaTimes
                  className={`${navbarStyles.headerTextColor} h-6 w-6`}
                />
              ) : (
                <FaBars className={`${navbarStyles.headerTextColor} h-6 w-6`} />
              )}
            </motion.div>
          </div>
          <motion.div
            ref={sidebarRef}
            className={`fixed top-0 left-0 h-full w-3/5 ${navbarStyles.backgroundColor} z-50 p-4`}
            initial="hidden"
            animate={isSidebarOpen ? "visible" : "hidden"}
            variants={sidebarVariants}
          >
            {/* Fixed Logo */}
            <div className="sticky top-0 z-50 bg-white">
              <img src={logo} alt="VivaVistaFe" className="h-16 select-none" />
              <hr className="w-full border-[0.1px] border-gray-900 mt-4" />
            </div>
            <div
              className="overflow-y-visible -mt-8"
              style={{ maxHeight: "calc(100% - 5rem)" }}
            >
              <motion.ul
                className={`${navbarStyles.headerTextColor} mt-10 space-y-4`}
              >
                {navItemsForMobile.map((item, index) => (
                  <motion.li
                    key={index}
                    className="relative"
                    variants={itemVariants}
                  >
                    {item.dropdown ? (
                      <div
                        className="relative"
                        // onMouseEnter={() => handleMouseEnter(index)}
                        // onMouseLeave={(e) => handleMouseLeave(index, e)}
                        onClick={() => toggleDropdown(index)}
                      >
                        <button
                          className={`flex justify-between items-center gap-2 px-4 py-2 rounded-lg transition-all duration-500 ease-in-out 
                            ${
                              item.name === "Hot Bargains"
                                ? "animate-blink"
                                : ""
                            }
                            ${
                              isDropdownActive(item.dropdown)
                                ? `${navbarStyles.activeTextColor} ${navbarStyles.activeBgColor}`
                                : `${navbarStyles.headerTextColor} ${navbarStyles.defaultBgColor} hover:text-deep-orange-500 hover:bg-transparent`
                            }`}
                        >
                          {item.name}
                          <motion.div
                            animate={{
                              rotate: dropdownStates[index] ? 180 : 0,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="ml-2"
                          >
                            <FaChevronDown />
                          </motion.div>
                        </button>
                        {dropdownStates[index] && (
                          <motion.ul
                            className="absolute left-0 top-full bg-white shadow-lg rounded-lg w-auto p-4 z-50 max-h-60 overflow-y-auto"
                            initial="hidden"
                            animate="visible"
                            variants={sidebarVariants}
                          >
                            {item.dropdown.map((subItem, subIndex) => (
                              <motion.li key={subIndex} variants={itemVariants}>
                                <Link
                                  to={subItem.href}
                                  className={`flex justify-start items-center gap-1 px-4 py-2 rounded-md transition-all duration-500 ease-in-out
            ${
              location.pathname === subItem.href
                ? `${navbarStyles.activeTextColor} ${navbarStyles.activeBgColor}`
                : `${navbarStyles.headerTextColor} ${navbarStyles.defaultBgColor} hover:text-deep-orange-500 hover:bg-transparent`
            }`}
                                  onClick={() => {
                                    closeAllDropdowns();
                                    toggleSidebar();
                                  }}
                                >
                                  <FaChevronRight /> {subItem.name}
                                </Link>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`block px-4 py-2 rounded-lg transition-all duration-500 ease-in-out
                           ${
                             item.name === "Hot Bargains" ? "animate-blink" : ""
                           }
                          ${
                            location.pathname === item.href
                              ? `${navbarStyles.activeTextColor} ${navbarStyles.activeBgColor}`
                              : `${navbarStyles.headerTextColor} ${navbarStyles.defaultBgColor} hover:text-deep-orange-500 hover:bg-transparent`
                          }`}
                        onClick={() => {
                          closeAllDropdowns();
                          toggleSidebar();
                        }}
                      >
                        {item.name}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </motion.div>
        </nav>
      ) : (
        // Desktop version: dropdown opens on hover
        <nav className={`${navbarStyles.backgroundColor} shadow-md`}>
          <div className="container mx-auto font-bold flex justify-between items-center p-2">
            <div className="flex justify-between items-center gap-10">
              <Link to="/">
                <img
                  src={logo}
                  alt="VivaVistaFe"
                  className="h-16 select-none"
                />
              </Link>
              <ul className="flex space-x-6">
                {navItems.map((item, index) => (
                  <li key={index} className="relative">
                    {item.dropdown ? (
                      <div
                        className="relative flex flex-col justify-center items-center"
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={(e) => handleMouseLeave(index, e)}
                      >
                        {/* <img
                          src={item.icon}
                          alt=""
                          className="h-10 w-10 object-cover mt-2 mr-4"
                        /> */}
                        <button
                          className={`flex justify-between items-center mt-2 gap-2 px-4 rounded-full bg-transparent transition-all duration-700 ease-in-out
                          ${item.name === "Hot Bargains" ? "animate-blink" : ""}
                          ${
                            dropdownStates[index]
                              ? `${navbarStyles.activeTextColor} ${navbarStyles.activeBgColor}`
                              : `${navbarStyles.headerTextColor} ${navbarStyles.defaultBgColor} hover:text-deep-orange-500 hover:bg-transparent`
                          }`}
                        >
                          {item.name}
                          <motion.div
                            animate={{
                              rotate: dropdownStates[index] ? 180 : 0,
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="ml-2"
                          >
                            <FaChevronDown />
                          </motion.div>
                        </button>
                        {dropdownStates[index] && (
                          <ul className="absolute grid grid-cols-3 gap-4 top-full bg-white drop-shadow-lg shadow-lg rounded-lg w-[700px] z-50 pt-10">
                            {item.dropdown.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                <Link
                                  to={subItem.href}
                                  className={`flex justify-start items-center gap-1 px-4 py-2 rounded-full transition-all duration-500 ease-in-out ${
                                    location.pathname === subItem.href
                                      ? `${navbarStyles.activeTextColor} ${navbarStyles.activeBgColor}`
                                      : `${navbarStyles.headerTextColor} ${navbarStyles.defaultBgColor} hover:text-deep-orange-500 hover:bg-transparent`
                                  }`}
                                  onClick={closeAllDropdowns}
                                >
                                  <FaChevronRight />
                                  {subItem.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`flex flex-col justify-center items-center px-4 py-2 rounded-full bg-transparent transition-all duration-500 ease-in-out
                           ${
                             item.name === "Hot Bargains" ? "animate-blink" : ""
                           }
                          ${
                            location.pathname === item.href
                              ? `${navbarStyles.activeTextColor} ${navbarStyles.activeBgColor}`
                              : `${navbarStyles.headerTextColor} ${navbarStyles.defaultBgColor} hover:text-deep-orange-500 hover:bg-transparent`
                          }`}
                        onClick={closeAllDropdowns}
                      >
                        {/* <img
                          src={item.icon}
                          alt=""
                          className="h-10 w-10 object-cover"
                        /> */}
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex justify-center items-center gap-8">
              <div className="relative bg-[#0073b4] rounded-xl p-[11px]">
                <button
                  className="cursor-pointer flex items-center space-x-2 text-lg font-medium text-white hover:text-black transition-colors duration-500 ease-in-out"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {/* Display the flag icon */}
                  <img
                    src={flagUrls[region]}
                    alt={`${region} flag`}
                    className="w-5 h-4 object-cover"
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
                    {["Canada", "USA", "UK"].map((item) => {
                      const urls = {
                        UK: "https://www.vivavistavacations.co.uk/",
                        USA: "https://www.vivavistavacations.com/",
                        Canada: "https://www.vivavistavacations.ca/",
                      };

                      return (
                        <li
                          key={item}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 text-[#D35400] font-semibold cursor-pointer transition-all duration-200"
                          onClick={() => {
                            setRegion(item);
                            setIsDropdownOpen(false);
                            window.open(urls[item], '_blank'); // 🔁 Open in new tab
                          }}
                        >
                          <img
                            src={flagUrls[item]}
                            alt={`${item} flag`}
                            className="w-5 h-4 object-cover"
                          />
                          <span>{item}</span>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </div>
              <a
                href="tel:+18000000000"
                className="flex items-center p-2 group bg-green-500 text-white rounded-xl hover:bg-teal-500 space-x-2 transition-colors duration-300 ease-in-out hover:text-orange-500 text-lg "
              >
                <div className="p-2 bg-white rounded-full text-orange-500 transition-colors duration-300 ease-in-out group-hover:text-blue-500">
                  <FaPhoneAlt />
                </div>
                <span className="hidden sm:inline">1 8** *** ****</span>
              </a>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
