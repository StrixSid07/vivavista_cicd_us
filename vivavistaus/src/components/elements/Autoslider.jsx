import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { water } from "../../assets";
import axios from "axios";
import { Base_Url } from "../../utils/Api";

const AutoSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [focused, setFocused] = useState(false);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    // Window resize handler
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Add event listener
    window.addEventListener("resize", handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Get slide dimensions based on window size
  const getSlideSize = () => {
    if (windowSize.width < 640) {
      return {
        width: Math.min(320, windowSize.width - 32) + "px", // account for padding
        height: "220px",
      };
    } else if (windowSize.width < 768) {
      return {
        width: "400px",
        height: "300px",
      };
    } else {
      return {
        width: "800px",
        height: "500px",
      };
    }
  };

  useEffect(() => {
    // Fetch autoslider data from API
    const fetchAutosliders = async () => {
      try {
        console.log("Fetching autoslider data from:", `${Base_Url}/autoslider`);
        
        const response = await axios.get(`${Base_Url}/autoslider`);
        
        // Check if response.data exists and is an array
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Map API data to the format expected by the component
          const slidesData = response.data.map(item => ({
            image: item.image,
            title: item.title,
            description: item.description
          }));
          setSlides(slidesData);
          console.log("Successfully loaded autoslider data:", slidesData);
        } else {
          console.log("No autoslider data found or response is not an array:", response.data);
          setSlides([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching autoslider data:", error);
        // Fall back to mock data for development/testing
        const mockSlides = [
          {
            title: "Example Slide 1",
            description: "This is a fallback slide when API is unavailable",
            image: "https://via.placeholder.com/800x500?text=Slide+1"
          },
          {
            title: "Example Slide 2",
            description: "Add your actual API URL in environment variables",
            image: "https://via.placeholder.com/800x500?text=Slide+2"
          }
        ];
        console.log("Using fallback mock data");
        setSlides(mockSlides);
        setLoading(false);
      }
    };

    fetchAutosliders();
  }, []);

  useEffect(() => {
    // Only start interval if we have slides
    if (slides.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [slides]);

  const nextSlide = () => {
    if (slides.length > 0) {
      setCurrentIndex((currentIndex + 1) % slides.length);
      setFocused(false);
    }
  };

  const prevSlide = () => {
    if (slides.length > 0) {
      setCurrentIndex((currentIndex - 1 + slides.length) % slides.length);
      setFocused(false);
    }
  };

  const handleFocus = () => {
    setFocused(!focused);
  };

  const getSlidePosition = (index) => {
    if (index === currentIndex) return "z-10 scale-110";
    if (index === (currentIndex - 1 + slides.length) % slides.length)
      return "z-0 -translate-x-[50%] opacity-70";
    if (index === (currentIndex + 1) % slides.length)
      return "z-0 translate-x-[50%] opacity-70";
    return "hidden";
  };

  // If loading or no slides, show a placeholder or nothing
  if (loading) {
    return null; // Optional: show a loading indicator here
  }

  // If no slides data, don't render the component
  if (slides.length === 0) {
    return null;
  }

  return (
    <div
      className="relative w-full h-[400px] sm:h-[450px] md:h-[90vh] overflow-hidden bg-white px-4 md:px-10"
      style={{
        backgroundImage: `url(${water})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-white md:flex hidden"></div>
      <div className="relative w-full h-full flex items-center justify-center">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute transition-transform duration-700 ease-in-out pl-4 pr-4 group ${getSlidePosition(
              index
            )} transform`}
          >
            <div
              className={`relative w-full overflow-hidden rounded-xl shadow-xl 
          transition-transform duration-500 
          ${
            index === currentIndex && focused
              ? "ring-4 ring-orange-500 scale-75"
              : ""
          }`}
              onClick={handleFocus}
              style={{
                width: getSlideSize().width,
                height: getSlideSize().height,
                maxWidth: "90vw",
                overflow: "hidden"
              }}
            >
              <div className="w-full h-full overflow-hidden">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover cursor-pointer transition-all duration-700 ease-in-out transform scale-110 group-hover:scale-125"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center"
                  }}
                />
              </div>
              <div className="absolute inset-0 md:w-1/2 w-full bg-gradient-to-r from-black/60 to-white/5 p-2 sm:p-4 md:p-8 flex flex-col justify-center text-white">
                <h2 className="text-lg sm:text-xl md:text-3xl font-bold transition-all duration-500 ease-in-out group-hover:scale-95 truncate">
                  {slide.title}
                </h2>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base w-full transition-all duration-500 ease-in-out group-hover:scale-95 line-clamp-2 sm:line-clamp-3 overflow-hidden text-ellipsis">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute hidden md:flex top-1/2 left-4 md:left-6 transform -translate-y-1/2 bg-white text-gray-800 p-3 md:p-4 rounded-full shadow-xl hover:bg-gray-200 transition"
      >
        <FaArrowLeft size={24} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute hidden md:flex top-1/2 right-4 md:right-6 transform -translate-y-1/2 bg-white text-gray-800 p-3 md:p-4 rounded-full shadow-xl hover:bg-gray-200 transition"
      >
        <FaArrowRight size={24} />
      </button>

      {/* Dots Navigation */}
      <div className="absolute md:hidden bottom-0 mt-10 pb-3 md:mt-20 left-1/2 transform -translate-x-1/2 flex gap-2 sm:gap-3 md:gap-4 lg:gap-5">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`${
              index === currentIndex ? "bg-orange-500 scale-110" : "bg-white"
            } 
          transition-transform cursor-pointer w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 rounded-full`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default AutoSlider;
