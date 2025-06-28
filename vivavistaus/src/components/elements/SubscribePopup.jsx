import React, { useState, useEffect } from "react";
import axios from "axios";
import { logo, SubscribeBackground } from "../../assets";
import { Base_Url } from "../../utils/Api";

const SubscribePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Show popup after 2 seconds of page load
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleSubscribe = async () => {
    setMessage(null);
    setError(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setMessage("Please enter a valid email address.");
      setError(true);
      setTimeout(() => {
        setMessage(null);
        setError(false);
      }, 5000);
      return;
    }

    try {
      const res = await axios.post(`${Base_Url}/home/subscribe-newsletter`, {
        email,
      });

      // Additionally trigger welcome email
      await axios.post(`${Base_Url}/mail/send-subscribe-message`, {
        email,
      });

      setMessage(res.data.message);
      setError(false);
      setEmail("");
      
      // Close popup after successful subscription
      setTimeout(() => {
        setIsOpen(false);
      }, 2000);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Subscription failed. Try again later."
      );
      setError(true);
    }

    setTimeout(() => {
      setMessage(null);
      setError(false);
    }, 5000);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>
      
      {/* Popup Content */}
      <div className="relative z-10 max-w-lg w-full mx-4">
        <div 
          className="relative bg-cover bg-center rounded-xl overflow-hidden shadow-2xl"
          style={{
            backgroundImage: `url(${SubscribeBackground})`,
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-60"></div>
          
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Content */}
          <div className="relative z-10 p-8 text-center">
            {/* Logo */}
            <div className="mb-6">
              <img
                src={logo}
                alt="Viva Vista Vacations"
                className="h-16 w-auto mx-auto bg-white rounded-lg p-2 shadow-lg"
              />
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-2">
              Never Miss a Deal!
            </h2>
            <p className="text-gray-200 mb-6">
              Subscribe to our newsletter and get exclusive travel deals delivered to your inbox.
            </p>

            {/* Email Input */}
            <div className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              
              <button
                onClick={handleSubscribe}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Subscribe Now
              </button>
            </div>

            {/* Message */}
            {message && (
              <p
                className={`mt-4 text-sm ${
                  error ? "text-red-300" : "text-green-300"
                }`}
              >
                {message}
              </p>
            )}

            {/* Skip option */}
            <button
              onClick={handleClose}
              className="mt-4 text-gray-300 hover:text-white text-sm underline transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscribePopup; 