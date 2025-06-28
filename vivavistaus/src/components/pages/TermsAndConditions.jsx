import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";
import axios from "axios";
import { Base_Url } from "../../utils/Api";

const TermsAndConditions = () => {
  const [openIndex, setOpenIndex] = useState(null);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch terms and conditions directly from API
  const fetchTerms = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${Base_Url}/terms`);
      setTerms(res.data);
    } catch (error) {
      console.error("Error fetching terms:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      <h1 className="text-4xl font-bold text-center mb-8 text-black">
        TERMS & CONDITIONS
      </h1>


      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Booking Conditions</h2>
        <p className="mb-4">
          The following terms and conditions ("Terms and Conditions") apply to all travel and travel-related services or arrangements offered for sale by Vivavistavacations.ca. Vivavistavacations.ca is a trading name of Viva Vista Vacations Ltd. These booking conditions form the basis of your contract with us. The terms "service," "services," or "travel arrangements" used throughout refer to bookings for flights, accommodation or hotels, resorts, transfers, excursions, car rentals, trains, cruises, ferries, coaches, or any other travel-related services.
        </p>
        <p className="mb-4">
          All references in these terms to "trip," "booking," "contract," "holiday," or "vacation" refer to such travel arrangements or any combination of services offered by us, unless otherwise specified.
        </p>
        <p className="mb-4">
          We are Viva Vista Vacations Ltd. References to "we," "us," "our," or Vivavistavacations refer to Viva Vista Vacations Ltd, a company registered in England and Wales with company number 16227067. Our registered office is located at 01 195-197 Wood Street, London,  E17 3NU, United Kingdom. Bookings made with us are subject to the conditions outlined below. Unless otherwise stated, these conditions apply solely to travel arrangements booked directly through us that we agree to provide or arrange under our agreement with you.
        </p>
        <p className="mb-4">
          References to "you" or "your" refer to the individual booking the travel arrangements or all persons named in the booking (including those added or substituted later). It is your responsibility to read these conditions carefully, as they outline the respective rights and obligations of both parties. By asking us to confirm your booking, we assume that you have read, understood, and agreed to these booking conditions.
        </p>
        <p className="mb-4">
          All bookings made through Vivavistavacations are also subject to the specific terms and conditions of the third-party suppliers providing the individual components of your travel arrangements.
        </p>
        <p className="mb-4">
          In this document, a "package" refers to the pre-arranged combination of at least two of the following elements sold or offered for sale at an inclusive price, covering more than 24 hours or including overnight accommodation:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>(a) Transport</li>
          <li>(b) Accommodation</li>
          <li>(c) Other tourism-related services not ancillary to transport or accommodation and forming a significant part of the package.</li>
        </ul>
      </section>


      <div className="max-w-4xl mx-auto p-6">
        {loading ? (
          <div className="text-center py-8">
            <p>Loading terms and conditions...</p>
          </div>
        ) : terms.length > 0 ? (
          terms.map((term, index) => (
            <div key={term._id} className="mb-8">
              {/* Title */}
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full flex justify-between text-start items-center py-4 md:text-2xl text-xl font-medium md:font-semibold text-black focus:outline-none"
              >
                <span>{term.title}</span>
                <FaChevronDown
                  className={`transition-transform duration-300 text-deep-orange-600 ${openIndex === index ? "rotate-180" : ""
                    }`}
                />
              </button>

              {/* Content */}
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mb-6 border-b border-gray-300 pb-4">
                  <div
                    className="text-black prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: term.content }}
                  />
                </div>
              </motion.div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p>No terms and conditions found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsAndConditions;
