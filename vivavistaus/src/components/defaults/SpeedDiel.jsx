import React from "react";
import { FaPhoneAlt, FaWhatsapp, FaEnvelope } from "react-icons/fa";

const SpeedDiel = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-2 px-1 py-2 md:gap-4 md:px-2 md:py-3 rounded-l-2xl md:bg-white/70 bg-white/50 transition-colors duration-500 ease-in-out hover:bg-white shadow-lg z-50">
      {/* Phone Link */}
      <a
        href="tel:+02037805023"
        className="text-green-500 hover:text-teal-600 transition-all duration-500 ease-in-out hover:scale-110"
      >
        <FaPhoneAlt size={18} />
      </a>
      {/* WhatsApp Link */}
      <a
        href="https://wa.me/442037805023"
        target="_blank"
        rel="noopener noreferrer"
        className="text-green-500 hover:text-teal-600 transition-all duration-500 ease-in-out hover:scale-110"
      >
        <FaWhatsapp size={24} />
      </a>

      {/* Email Link */}
      <a
        href="mailto:admin@vivavistavacations.ca"
        className="text-green-500 hover:text-teal-600 transition-all duration-500 ease-in-out hover:scale-110"
      >
        <FaEnvelope size={24} />
      </a>
    </div>
  );
};

export default SpeedDiel;
