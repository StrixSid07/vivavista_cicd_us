import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Typography } from "@material-tailwind/react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { PiXLogoFill } from "react-icons/pi";
import { FaLocationDot } from "react-icons/fa6";

import {
  certilogo,
  logo,
  payment1,
  payment2,
  payment6,
  availability,
} from "../../assets";

const navInfos = [
  { name: "About Us", href: "/AboutUs" },
  { name: "FAQ's", href: "/faq" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms & Conditions", href: "/termsandcondition" },
  { name: "Services", href: "/" },
];

const quickLinks = [
  { name: "Contact Us", href: "/ContactUs" },
  { name: "Cookies", href: "/cookies" },
  { name: "Group Booking", href: "/" },
  { name: "Blog", href: "/" },
];

const currentYear = new Date().getFullYear();

export default function FooterNew() {
  // Scroll to top on route change
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <footer className="relative w-full pt-20 pb-4 bg-[#0b1121] text-white">
      <div className="mx-auto w-full max-w-7xl px-8">
        <div className="flex md:flex-row flex-col">
          <div className="flex flex-col justify-center items-center">
            <img
              src={logo}
              alt="Viva Vissta  Vacation"
              className="h-24 md:mb-4"
            />
            <Typography variant="h6" className="mb-6">
              Your Journey, Our Expertise.
            </Typography>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid md:grid-cols-3 grid-cols-1 gap-x-6">
              {/* Column 1: Contact Info */}
              <ul>
                <Typography
                  variant="small"
                  color="blue-white"
                  className="mb-3 font-medium opacity-40"
                >
                  Contact Info
                </Typography>

                <li className="flex items-center mb-2 text-sm">
                  <FaPhoneAlt
                    size={18}
                    className="text-orange-600 mr-2 flex-shrink-0"
                  />
                  {/* phone link stays <a> */}
                  <a
                    href="tel:+02037805023"
                    className="text-white hover:text-orange-600"
                  >
                    020 3780 5023
                  </a>
                </li>

                <li className="flex items-center mb-2 text-sm">
                  <FaEnvelope
                    size={18}
                    className="text-orange-600 mr-2 flex-shrink-0"
                  />
                  {/* email link stays <a> */}
                  <a
                    href="mailto:admin@vivavistavacations.ca"
                    className="text-white hover:text-orange-600 break-all"
                  >
                    admin@vivavistavacations.ca
                  </a>
                </li>

                <li className="flex items-start text-sm">
                  <FaLocationDot
                    size={18}
                    className="text-orange-600 mr-2 flex-shrink-0 mt-1"
                  />
                  {/* address is internal, use Link */}
                  <Link to="/" className="text-white hover:text-orange-600">
                    01, 195-197 Wood Street,
                    <br />
                    London, England, E17 3NU
                  </Link>
                </li>
              </ul>

              {/* Column 2: Quick Links */}
              <ul>
                <Typography
                  variant="small"
                  color="blue-white"
                  className="mb-3 font-medium opacity-40"
                >
                  Quick Links
                </Typography>
                {quickLinks.map((item) => (
                  <li key={item.name} className="mb-2 text-sm">
                    <Typography
                      as={Link}
                      to={item.href}
                      color="white"
                      className="transition-colors hover:text-gray-400"
                    >
                      {item.name}
                    </Typography>
                  </li>
                ))}
              </ul>

              {/* Column 3: Information */}
              <ul>
                <Typography
                  variant="small"
                  color="blue-white"
                  className="mb-3 font-medium opacity-40"
                >
                  Information
                </Typography>
                {navInfos.map((item) => (
                  <li key={item.name} className="mb-2 text-sm">
                    <Typography
                      as={Link}
                      to={item.href}
                      color="white"
                      className="transition-colors hover:text-gray-400"
                    >
                      {item.name}
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <h1 className="mt-12 flex md:justify-start md:text-start justify-center text-center">Boook With Confiodence</h1>
        <div className="flex flex-col border-t border-blue-white-50 py-4 md:flex-row md:justify-between gap-4 items-center">
          <img
            src={certilogo}
            className="h-14 mt-2 w-auto object-fill"
            alt=""
          />
          <Typography
            variant="small"
            className="mb-4 text-center font-normal text-gray-400 md:mb-0"
          >
            &copy; {currentYear}{" "}
            <a
              href="https://www.vivavistavacations.ca/"
              className="hover:text-orange-500 transition duration-700 text-orange-700"
            >
              Viva Vista Vacations
            </a>
            . All Rights Reserved.
          </Typography>
          <div className="flex gap-4 text-gray-400">
            {/* all social links are external */}
            <a
              href="https://www.facebook.com/share/1DQGeYZjJJ/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-900"
            >
              <FaFacebookF size={24} />
            </a>
            <a
              href="https://www.instagram.com/vivavistavacations?igsh=MTVqdHBjaGZlZGVhOA=="
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-500"
            >
              <FaInstagram size={24} />
            </a>
            <a
              href="https://x.com/vivavvacations?s=11"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
            >
              <PiXLogoFill size={24} />
            </a>
            <a
              href="https://wa.me/442037805023"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-700"
            >
              <FaWhatsapp size={24} />
            </a>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center text-center">
          <p className="px-4">
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
      </div>
    </footer>
  );
}
