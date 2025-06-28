import React, { useState } from "react";
import axios from "axios";
import { logo, pattern } from "../../assets";
import { Base_Url } from "../../utils/Api";

const CardOver = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null); // success or error
  const [error, setError] = useState(false);

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

  return (
    <div className="relative overflow-hidden bg-[#0078D4] max-w-3xl w-full mx-auto rounded-t-xl px-6 md:px-10 py-8 md:py-12">
      <div
        className="absolute inset-0 opacity-20 z-0 bg-repeat filter invert"
        style={{
          backgroundImage: `url(${pattern})`,
          backgroundSize: "contain",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/90 hidden md:flex"></div>
      </div>

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex flex-col justify-center items-center md:items-start space-y-4 w-full md:w-2/3">
          <h1 className="text-xl md:text-3xl w-full text-center md:text-left text-white customfontstitle">
            Love to Travel? So Do We - Let's Stay in Touch.
          </h1>

          <div className="flex flex-col md:flex-row w-full max-w-md">
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full text-lg md:text-xl rounded-t-md md:rounded-l-md md:rounded-tr-none bg-white text-black font-medium p-3"
            />
            <button
              onClick={handleSubscribe}
              className="w-full md:w-auto text-white text-lg md:text-xl bg-deep-orange-500 hover:bg-black transition-colors duration-700 ease-in-out font-bold rounded-b-md md:rounded-r-md md:rounded-bl-none px-6 py-3"
            >
              SUBSCRIBE
            </button>
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-sm md:text-base ${
                error ? "text-red-300" : "text-green-300"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <div className="flex justify-center md:justify-end z-0 w-full md:w-1/3">
          <img
            src={logo}
            alt="Logo"
            className="h-32 w-32 bg-white rounded-md p-1 shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default CardOver;
