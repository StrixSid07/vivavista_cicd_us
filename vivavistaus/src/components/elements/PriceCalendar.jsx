import React, { useState, useEffect } from "react";
import axios from "axios";

const PriceCalendar = ({ productId }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [travelers, setTravelers] = useState(2);
  const pricePerPerson = product ? product.price : 479;
  const totalPrice = travelers * pricePerPerson;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`https://api.example.com/products/${productId}`);
        setProduct(response.data);
      } catch (error) {
        console.error("Failed to fetch product:", error);
        // Use dummy data on failure
        setProduct({
          id: productId,
          name: "Dummy Product",
          description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
          itinerary: "Day 1: Arrival\nDay 2: City Tour\nDay 3: Departure",
          price: 479,
          terms: "No refunds after booking confirmation.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleTravelerChange = (change) => {
    if (travelers + change >= 1) {
      setTravelers(travelers + change);
    }
  };

  if (loading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 p-5">
      {/* Tabs Section */}
      <div className="lg:w-3/4 w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex space-x-8 border-b pb-2">
          {["overview", "itinerary", "pricecalendar", "terms"].map((tab) => (
            <button
              key={tab}
              className={`text-gray-500 hover:text-orange-500 ${
                activeTab === tab ? "text-orange-500 border-b-2 border-orange-500 font-bold" : ""
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <div>
              <h2 className="text-2xl font-bold">{product.name}</h2>
              <p className="text-gray-600 mt-2">{product.description}</p>
            </div>
          )}
          {activeTab === "itinerary" && (
            <div>
              <h3 className="text-xl font-bold">Itinerary</h3>
              <pre className="text-gray-600 whitespace-pre-wrap">{product.itinerary}</pre>
            </div>
          )}
          {activeTab === "pricecalendar" && (
            <div>
              <h3 className="text-xl font-bold">Price Calendar</h3>
              <p className="text-gray-600">Price per person: ${product.price}</p>
            </div>
          )}
          {activeTab === "terms" && (
            <div>
              <h3 className="text-xl font-bold">Terms & Conditions</h3>
              <p className="text-gray-600">{product.terms}</p>
            </div>
          )}
        </div>
      </div>

      {/* Price Details */}
      <div className="lg:w-1/4 w-full bg-white rounded-lg shadow-md p-6 mt-6 lg:mt-0 lg:ml-6">
        <h2 className="text-xl font-bold text-gray-800">Price from</h2>
        <div className="text-orange-500 text-3xl font-bold">${pricePerPerson}</div>
        <p className="text-sm text-gray-500">per person</p>

        <div className="mt-4">
          <label className="block text-gray-600 font-medium">Departure Date</label>
          <select className="w-full p-2 border rounded-md mt-1">
            <option>1 Apr 2025 - ${pricePerPerson}</option>
          </select>
        </div>

        <div className="mt-4">
          <label className="block text-gray-600 font-medium">Departure Airport</label>
          <select className="w-full p-2 border rounded-md mt-1">
            <option>London Gatwick</option>
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <label className="text-gray-600 font-medium">Number of Travelers</label>
          <div className="flex items-center">
            <button
              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => handleTravelerChange(-1)}
            >
              -
            </button>
            <span className="mx-3">{travelers} Adults</span>
            <button
              className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              onClick={() => handleTravelerChange(1)}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-bold text-gray-800">Total Price:</h3>
          <div className="text-orange-500 text-3xl font-bold">${totalPrice}</div>
        </div>

        <button className="w-full bg-orange-500 text-white py-3 rounded-lg mt-4 hover:bg-orange-600">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default PriceCalendar;
