import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { HiChevronRight } from "react-icons/hi";
import { FaLocationDot } from "react-icons/fa6";
import { PiXLogoFill } from "react-icons/pi";
import {
  certilogo,
  logo,
  payment1,
  payment2,
  payment6,
  availability,
} from "../../assets";

const currentYear = new Date().getFullYear();

const Footer = () => {
  const navInfos = [
    { name: "About Us", href: "/AboutUs" },
    { name: "FAQ's", href: "/faq" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/termsandcondition" },
  ];

  const quickLinks = [
    { name: "Contact Us", href: "/ContactUs" },
    { name: "Cookies", href: "/cookies" },
    { name: "Group Booking", href: "/groupbooking" },
    { name: "Blog", href: "/blogs" },
  ];

  const navMaps = [
    { name: "United Kingdom", href: "/uk", flag: "https://flagcdn.com/gb.svg" },
    { name: "United States", href: "/us", flag: "https://flagcdn.com/us.svg" },
    { name: "Canada", href: "/canada", flag: "https://flagcdn.com/ca.svg" },
    {
      name: "Australia",
      href: "/australia",
      flag: "https://flagcdn.com/au.svg",
    },
  ];

  // Scroll to top on route change
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <footer className="bg-[#0b1121] text-white py-10 px-5 md:px-10 md:pt-28 lg:px-10 pt-20">
      <div className="max-w-full p-10 mx-auto grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Column 1: About Section */}
        <div className="flex flex-col items-start">
          <img
            src={logo}
            alt="Viva Vissta  Vacation"
            className="h-24 md:mb-4"
          />
          <p className="mb-4 flex flex-wrap">Your Journey, Our Expertise.</p>
          <div className="flex justify-center flex-col items-start gap-2 mb-4">
            <a
              href="https://wa.me/18000000000" // Updated WhatsApp link for Canada
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center w-52 justify-between gap-1 bg-green-600 text-white font-medium px-3 py-3 rounded-lg shadow-md hover:bg-teal-700 transition-all duration-300"
            >
              <FaWhatsapp className="text-md" />
              <span>Chat on WhatsApp</span>
              <HiChevronRight className="text-md" />
            </a>
            <div className="flex flex-col justify-center items-center w-48">
              {/* Icon with circular background and border */}
              <div className="w-24 h-24 flex items-center justify-center bg-[#304F47] rounded-full border-2 border-orange-500 mt-6">
                <img src={availability} className="h-20 p-2" alt="support" />
              </div>
              {/* Text below the icon */}
              <p className="mt-3 text-orange-500 font-medium">
                Around-the-Clock Care!
              </p>
            </div>
          </div>
        </div>

        {/* Column 2: Contact Info */}
        <div>
          <h2 className="text-md font-bold mb-5">Contact Info</h2>
          <ul className="space-y-4">
            <li className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-white text-center sm:text-left mb-4 sm:mb-0">
                <span className="font-bold text-orange-600">
                  {" "}
                  <FaPhoneAlt size={18} />
                </span>
                <span className="transition duration-700 ease-in-out hover:text-orange-600">
                  <a href="tel:+18000000000"> 1 8** *** ****</a>
                </span>{" "}
              </div>
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold -mt-4 md:mt-0 text-orange-600">
                <FaEnvelope size={18} />
              </span>
              <span className="transition duration-700 ease-in-out hover:text-orange-600">
                <a
                  href="mailto:admin@vivavistavacations.ca"
                  className="block -mt-4 md:w-60 md:mt-0 overflow-hidden text-ellipsis md:whitespace-nowrap"
                >
                  admin@vivavistavacations.ca
                </a>
              </span>
            </li>
            <li className="flex items-center">
              <div className="text-white flex w-64 items-start justify-center gap-1 group sm:text-left mb-4 sm:mb-0 ml-0">
                <span className="font-bold   text-orange-600">
                  {" "}
                  <FaLocationDot size={18} />
                </span>
                <br />{" "}
                <a
                  href="/"
                  target="_blank"
                  className="transition-all ease-in-out group-hover:text-orange-600"
                >
                  01, 195-197 Wood Street, London, England, E17 3NU
                </a>
              </div>
            </li>
          </ul>
          <h2 className="text-2xl font-bold mb-4 mt-5 md:flex hidden">
            Follow Us:
          </h2>
          <div className="md:flex mt-4 space-x-4 hidden">
            <div className=" flex flex-col justify-center items-center space-y-2 group">
              <a
                href="https://www.facebook.com/share/1DQGeYZjJJ/?mibextid=wwXIfr"
                target="_new"
                className="transition-all ease-out duration-500 group-hover:text-blue-900"
              >
                <FaFacebookF size={24} />
              </a>
            </div>
            <div className=" flex flex-col justify-center items-center space-y-2 group mt-2">
              <a
                href="https://www.instagram.com/vivavistavacations?igsh=MTVqdHBjaGZlZGVhOA=="
                target="_new"
                className="transition-all ease-out duration-500 group-hover:text-pink-500"
              >
                <FaInstagram size={24} />
              </a>
            </div>
            <div className=" flex flex-col justify-center items-center space-y-2 group mt-2">
              <a
                href="https://x.com/vivavvacations?s=11"
                target="_new"
                className="transition-all ease-out duration-500 group-hover:text-blue-500"
              >
                <PiXLogoFill size={24} />
              </a>
            </div>
            <div className=" flex flex-col justify-center items-center space-y-2 group mt-2">
              <a
                href="https://wa.me/18000000000"
                target="_new"
                className="transition-all ease-out duration-500 group-hover:text-green-700"
              >
                <FaWhatsapp size={24} />
              </a>
            </div>
          </div>
        </div>

        {/* Column 3: Quick Links */}
        <div className="flex flex-col md:ml-12">
          <h2 className="text-md font-bold mb-5 flex flex-row">Quick Links</h2>
          <ul className="space-y-4">
            {quickLinks.map((item, index) => (
              <li key={index}>
                <Link to={item.href} className="hover:text-orange-600">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Information Links */}
        <div className="flex flex-col">
          <h2 className="text-md font-bold mb-5">Information</h2>
          <ul className="space-y-4">
            {navInfos.map((item, index) => (
              <li key={index}>
                <Link to={item.href} className="hover:text-orange-600">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col items-center justify-center px-4 md:-mt-28">
          {/* Title */}
          <h2 className="text-md md:text-md font-bold mb-5 text-center md:flex hidden">
            Payment Partners
          </h2>

          {/* Payment Logos */}
          <div className="md:grid grid-cols-3 gap-4 md:gap-6 mb-6 place-items-center hidden">
            {[payment1, payment2, payment6].map((payment, index) => (
              <img
                key={index}
                src={payment}
                alt={`Payment method ${index + 1}`}
                className="h-12 object-contain"
              />
            ))}
          </div>

          {/* Nav List (Country Links) */}
          <div className="w-full max-w-sm">
            <h2 className="text-md md:text-md font-bold mb-5 text-center md:hidden -ml-[50px]">
              With a Personal Travel Touch.
            </h2>
            <ul className="space-y-4 -ml-[16px] md:ml-6">
              {navMaps.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.href}
                    className="hover:text-orange-600 flex items-center gap-2"
                  >
                    <img
                      src={item.flag}
                      alt={item.name}
                      className="w-5 h-4 rounded-sm object-cover"
                    />
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mb-2">
        <h1>Book With Confidence</h1>
        <img src={certilogo} className="h-14 mt-2 w-auto object-fill" alt="" />
      </div>

      <div className="border-t border-gray-700 pt-1 text-center">
        <div className="flex flex-col justify-center items-center mb-6 md:hidden">
          <h2 className="md:text-2xl text-md font-medium md:font-bold mb-5 md:text-center">
            Payment Partners
          </h2>
          <div className="grid md:grid-cols-3 grid-cols-3 gap-1 md:max-w-60 max-w-80">
            {[payment1, payment2, payment6].map((payment, index) => (
              <img
                key={index}
                src={payment}
                alt={`Payment method ${index + 1}`}
                className="h-12"
              />
            ))}
          </div>
        </div>

        <div className="flex mt-4 justify-center items-center space-x-8 md:hidden">
          <div className=" flex flex-col justify-center items-center space-y-2 group">
            <a
              href="https://www.facebook.com/share/1DQGeYZjJJ/?mibextid=wwXIfr"
              className="transition-all ease-out duration-500 group-hover:text-blue-900"
            >
              <FaFacebookF size={24} />
            </a>
          </div>
          <div className=" flex flex-col justify-center items-center space-y-2 group mt-2">
            <a
              href="https://www.instagram.com/vivavistavacations?igsh=MTVqdHBjaGZlZGVhOA=="
              className="transition-all ease-out duration-500 group-hover:text-pink-500"
            >
              <FaInstagram size={24} />
            </a>
          </div>
          <div className=" flex flex-col justify-center items-center space-y-2 group mt-2">
            <a
              href="https://x.com/vivavvacations?s=11"
              className="transition-all ease-out duration-500 group-hover:text-blue-500"
            >
              <PiXLogoFill size={24} />
            </a>
          </div>
          <div className=" flex flex-col justify-center items-center space-y-2 group mt-2">
            <a
              href="https://wa.me/18000000000"
              className="transition-all ease-out duration-500 group-hover:text-green-700"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
        <div
          variant="small"
          className="-mb-1 mt-3 pt-2 text-center font-normal text-white md:mb-0"
        >
          &copy; {currentYear}{" "}
          <span className="text-orange-600 transition duration-700 hover:text-orange-400">
            <a href="https://www.vivavistavacations.ca/">
              Viva Vista Vacations
            </a>
            .
          </span>{" "}
          All Rights Reserved.
        </div>

        <p className="text-center mt-3 px-4">
          The Government of Canada offers comprehensive, up-to-date travel advice, covering important information on safety, entry requirements, health, and travel warnings tailored to each destination. For Canadians planning international travel, this resource provides crucial updates to help prepare for safe and informed journeys. Given the dynamic nature of global conditions, travelers are encouraged to consult the Government of Canada's travel advisories before departure and regularly during their travels to stay informed of any changes.
        </p>
        <a
          href="https://travel.gc.ca/travelling/advisories"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 transition duration-700 hover:text-blue-400"
        >
          travel.gc.ca/travelling/advisories
        </a>
      </div>
    </footer>
  );
};

export default Footer;
