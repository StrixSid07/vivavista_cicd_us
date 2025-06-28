import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
  Select,
  Option,
  Dialog,
  DialogBody,
} from "@material-tailwind/react";
import {
  FaLock,
  FaMoneyBillWave,
  FaHeadphonesAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import CalendarView from "./CalendarView";
import ConciergeFormCard from "./ConciergeFormCard";
import { LeadContext } from "../../contexts/LeadContext";

// Custom hook for media query
const useCustomMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => {
      setMatches(media.matches);
    };
    
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};

const FilterElement = ({
  dealId,
  dealtitle,
  departureDates, // Array of departure dates (strings)
  departureAirports, // Array of departure airports (strings)
  prices, // Full price data array
  setSelectedTrip,
  initialAdultCount = 2, // Changed default to 2
  onBookingSubmit, // Callback function to handle submit
  selectedDate, // Rename here
  selectedAirport, // Rename here
  onDateChange, // setter from parent
  onAirportChange, // setter from parent
  priceMap,
  setLedprice,
  switchToPriceCalendarTab, // Add new prop for tab switching
}) => {
  // const [adultCount, setAdultCount] = useState(initialAdultCount);
  // const [selectedDate, setSelectedDate] = useState(
  //   departureDates && departureDates.length > 0 ? departureDates[0] : ""
  // );
  // const [selectedAirport, setSelectedAirport] = useState(
  //   departureAirports && departureAirports.length > 0
  //     ? departureAirports[0]
  //     : ""
  // );

  const { leadPrice, setLeadPrice } = useContext(LeadContext);
  const { adultCount, setAdultCount } = useContext(LeadContext);
  const { setTotalPrice, totalPrice, setDealIdForm, setDealtitleForm } =
    useContext(LeadContext);
  setDealIdForm(dealId);
  setDealtitleForm(dealtitle);
  
  // Use ref to track if initial adult count has been set
  const initialAdultCountSet = useRef(false);

  // Set initial adult count to 2 on component mount
  useEffect(() => {
    // Only run once and only if adultCount is less than 2
    if (!initialAdultCountSet.current && adultCount < 2) {
      setAdultCount(2);
      initialAdultCountSet.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  // Flatten the departureAirports (if it's a nested array)
  const flatDepartureAirports = departureAirports.flat();

  // Get unique airports based on `_id`
  const uniqueDepartureAirports = [
    ...new Set(flatDepartureAirports.map((airport) => 
      typeof airport === 'string' ? airport : airport._id
    )),
  ].map((id) => {
    const airport = flatDepartureAirports.find((a) => 
      (typeof a === 'string' ? a : a._id) === id
    );
    return typeof airport === 'string' ? { _id: airport, name: airport } : airport;
  });

  console.log("THIS IS UNIQUE", uniqueDepartureAirports);
  const handleDecrement = () => {
    // Prevent reducing below 2
    const newCount = Math.max(2, adultCount - 1);
    setAdultCount(newCount);
    setTotalPrice(leadPrice * newCount);
  };

  // Increment traveler count
  const handleIncrement = () => {
    const newCount = adultCount + 1;
    setAdultCount(newCount);
    setTotalPrice(leadPrice * newCount);
  };

  // Calculate total price dynamically
  // const totalPrice = leadPrice * adultCount;
useEffect(() => {
    setTotalPrice(leadPrice * adultCount);
  console.log(totalPrice);
  }, [leadPrice, adultCount]);
  
  // Submit booking data to parent component
  // const handleSubmit = () => {
  //   const bookingData = {
  //     selectedDate,
  //     selectedAirport,
  //     adultCount,
  //     totalPrice,
  //   };
  //   if (onBookingSubmit) {
  //     onBookingSubmit(bookingData);
  //   }
  // };
  const handleSubmit = () => {
    setOpenDialog(true); // Show the concierge dialog
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // Auto-select first airport if none is selected
  useEffect(() => {
    if (!selectedAirport && uniqueDepartureAirports.length > 0) {
      onAirportChange(uniqueDepartureAirports[0]._id); // Auto-select the first airport
    }
  }, [selectedAirport, uniqueDepartureAirports, onAirportChange]);
  
  // Find and set the cheapest price on component mount (one-time initialization)
  useEffect(() => {
    // Only run if prices are available
    if (prices && prices.length > 0) {
      // Filter out prices with priceswitch=true and ensure valid airport data
      const validPrices = prices.filter(price => 
        !price.priceswitch && 
        price.airport && 
        (typeof price.airport === 'object' || typeof price.airport === 'string' || Array.isArray(price.airport))
      );
      
      if (validPrices.length > 0) {
        // Find the cheapest price
        const cheapestPrice = validPrices.reduce((cheapest, current) => {
          return (current.price < cheapest.price) ? current : cheapest;
        }, validPrices[0]);
        
        console.log("Setting initial cheapest price:", cheapestPrice.price);
        
        // Set the lead price to the cheapest price
        setLeadPrice(cheapestPrice.price);
        
        // Also select the corresponding date and airport for consistency
        const cheapestDate = new Date(cheapestPrice.startdate).toLocaleDateString("en-GB");
        onDateChange(cheapestDate);
        
        // Find the first valid airport from the cheapest price
        let airportId;
        if (Array.isArray(cheapestPrice.airport) && cheapestPrice.airport.length > 0) {
          const firstAirport = cheapestPrice.airport[0];
          airportId = typeof firstAirport === 'object' ? firstAirport._id : firstAirport;
        } else if (typeof cheapestPrice.airport === 'object' && cheapestPrice.airport) {
          airportId = cheapestPrice.airport._id;
        } else {
          airportId = cheapestPrice.airport;
        }
        
        if (airportId) {
          onAirportChange(airportId);
        }
      }
    }
  }, [prices, onDateChange, onAirportChange, setLeadPrice]);

  // Function to safely update price in both React state and DOM
  const updatePrice = (newPrice) => {
    if (!newPrice || isNaN(newPrice)) return;
    
    // Update state
    setLeadPrice(newPrice);
    setTotalPrice(newPrice * adultCount);
    
    // Wait for next frame to ensure React has processed state change
    requestAnimationFrame(() => {
      // Check if DOM needs direct update
      const priceElement = document.querySelector('.price-display');
      const totalPriceElement = document.querySelector('.total-price-display');
      
      if (priceElement && priceElement.textContent !== `$${newPrice}`) {
        priceElement.textContent = `$${newPrice}`;
      }
      
      if (totalPriceElement && totalPriceElement.textContent !== `$${newPrice * adultCount}`) {
        totalPriceElement.textContent = `$${newPrice * adultCount}`;
      }
    });
  };
  
  // Create a function to directly click the Price Calendar tab
  const clickPriceCalendarTab = () => {
    console.log("Attempting to click Price Calendar tab");
    
    // Try the direct ID approach first (most reliable)
    const priceCalendarTabById = document.getElementById('tab-price-calendar');
    if (priceCalendarTabById) {
      console.log("Found Price Calendar tab by ID, clicking it");
      priceCalendarTabById.click();
      return; // Exit early if we found it
    }
    
    // Find the Price Calendar tab button using its text content
    const tabButtons = document.querySelectorAll('[role="tab"]');
    console.log(`Found ${tabButtons.length} tab buttons`);
    
    for (let i = 0; i < tabButtons.length; i++) {
      console.log(`Tab ${i} text: "${tabButtons[i].textContent.trim()}"`);
      if (tabButtons[i].textContent.trim() === "Price Calendar") {
        console.log("Found Price Calendar tab, clicking it");
        tabButtons[i].click();
        return; // Exit early if we found it
      }
    }
    
    // Alternative approach - try finding the tab by its URL hash or value
    const priceCalendarTabs = document.querySelectorAll('[value="price-calendar"]');
    if (priceCalendarTabs.length > 0) {
      console.log("Found Price Calendar tab by value attribute, clicking it");
      priceCalendarTabs[0].click();
      return; // Exit early if we found it
    }
    
    // Create and dispatch a custom event for the FilterPageSlides component to listen to
    const switchTabEvent = new CustomEvent('switchToPriceCalendar', {
      bubbles: true, // This allows the event to bubble up through the DOM
      detail: { tabName: 'price-calendar' }
    });
    document.dispatchEvent(switchTabEvent);
    console.log("Dispatched custom event: switchToPriceCalendar");
  };
  
  // Modified handleAirportChange to switch to Price Calendar tab
  const handleAirportChange = (value) => {
    if (onAirportChange) {
      onAirportChange(value);
    }
    
    // Find all trips for this airport and update price
    const trips = prices.filter((p) => {
      // Handle different airport data structures
      if (Array.isArray(p.airport)) {
        return p.airport.some((a) => a._id === value);
      } else if (typeof p.airport === 'object' && p.airport) {
        return p.airport._id === value;
      } else {
        return p.airport === value;
      }
    });

    if (trips.length > 0) {
      // Find the cheapest price for this airport
      const cheapestTrip = trips.reduce((prev, current) =>
        prev.price < current.price ? prev : current
      );

      setSelectedTrip(cheapestTrip);
      updatePrice(cheapestTrip.price);
      
      // Set date associated with this price
      if (onDateChange) {
        onDateChange(
          new Date(cheapestTrip.startdate).toLocaleDateString("en-GB")
        );
      }
    }
    
    // Directly click the Price Calendar tab after a short delay to ensure DOM is ready
    setTimeout(() => {
      clickPriceCalendarTab();
    }, 50);
  };
  
  // Update price when selection changes
  useEffect(() => {
    if (!selectedDate || !selectedAirport || !prices || prices.length === 0) return;
    
    // Find prices for the selected airport and date
    const matchingPrices = prices.filter(price => {
      // Match date
      const priceDate = new Date(price.startdate).toLocaleDateString("en-GB");
      if (priceDate !== selectedDate) return false;
      
      // Match airport
      let hasSelectedAirport = false;
      if (Array.isArray(price.airport)) {
        hasSelectedAirport = price.airport.some(airport => 
          (typeof airport === 'object' && airport._id === selectedAirport) || airport === selectedAirport
        );
      } else if (typeof price.airport === 'object' && price.airport) {
        hasSelectedAirport = price.airport._id === selectedAirport;
      } else {
        hasSelectedAirport = price.airport === selectedAirport;
      }
      
      return hasSelectedAirport && !price.priceswitch;
    });
    
    if (matchingPrices.length > 0) {
      // Use the cheapest price for this date and airport
      const cheapestPrice = matchingPrices.reduce((min, price) => 
        price.price < min.price ? price : min, matchingPrices[0]).price;
      
      // Update price
      updatePrice(cheapestPrice);
    }
  }, [selectedDate, selectedAirport, prices]);

  // Add a reference to track component mounted state
  const isMounted = useRef(false);
  const lastSelectedAirport = useRef(selectedAirport);
  
  // Set mounted flag on component mount
  useEffect(() => {
    isMounted.current = true;
    
    // Force initial price update
    if (leadPrice) {
      updatePrice(leadPrice);
    }
    
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Track airport changes
  useEffect(() => {
    if (selectedAirport !== lastSelectedAirport.current) {
      lastSelectedAirport.current = selectedAirport;
      
      // Find price for new airport
      if (selectedDate && prices && prices.length > 0) {
        const airportPrices = prices.filter(price => {
          const priceDate = new Date(price.startdate).toLocaleDateString("en-GB");
          if (priceDate !== selectedDate) return false;
          
          let hasSelectedAirport = false;
          if (Array.isArray(price.airport)) {
            hasSelectedAirport = price.airport.some(airport => 
              (typeof airport === 'object' && airport._id === selectedAirport) || airport === selectedAirport
            );
          } else if (typeof price.airport === 'object' && price.airport) {
            hasSelectedAirport = price.airport._id === selectedAirport;
          } else {
            hasSelectedAirport = price.airport === selectedAirport;
          }
          
          return hasSelectedAirport && !price.priceswitch;
        });
        
        if (airportPrices.length > 0) {
          const cheapestPrice = airportPrices.reduce((min, price) => 
            price.price < min.price ? price : min, airportPrices[0]).price;
          
          // Update price
          updatePrice(cheapestPrice);
        }
      }
    }
  }, [selectedAirport, selectedDate, prices]);

  // Enhanced click handlers for price card interactions
  const handlePriceCardInteraction = () => {
    // Directly click the Price Calendar tab
    clickPriceCalendarTab();
  };

  // Check if on mobile using our custom hook
  const isMobileView = useCustomMediaQuery("(max-width: 768px)");

  // Create state to track window height
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  // Update window height when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setWindowHeight(window.innerHeight);
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <Card
      className={`w-full shadow-lg transition-all duration-300 hover:shadow-xl ${
        !isMobileView ? "sticky top-20" : ""
      } mt-0`}
      style={{ maxHeight: isMobileView ? "none" : "calc(100vh - 100px)" }}
    >
      <CardHeader
        color="white"
        className={`flex flex-col items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-600 cursor-pointer ${
          isMobileView ? "py-3" : "py-6"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          handlePriceCardInteraction();
        }}
      >
        <Typography variant="small" className="text-white customfontstitle mb-1">
          Price from
        </Typography>
        <Typography
          variant={isMobileView ? "h4" : "h3"}
          className="font-bold leading-tight text-white customfontstitle price-display"
        >
          ${leadPrice}
        </Typography>
        <Typography variant="small" className="text-white customfontstitle mt-1">
          per person
        </Typography>
      </CardHeader>

      {/* Body: Selectors & Price */}
      <CardBody className={`p-4 space-y-6 ${isMobileView ? "py-3" : "px-5 py-5"}`}>
        {/* Departure Airport */}
        <div onClick={handlePriceCardInteraction} className={isMobileView ? "" : "mb-2"}>
          <Typography
            variant="small"
            className="font-medium text-gray-700 mb-2 customfontstitle"
          >
            Departure Airport
          </Typography>
          <Select
            label="Select Airport"
            size={isMobileView ? "sm" : "md"}
            value={selectedAirport}
            className="customfontstitle"
            onChange={handleAirportChange}
            onClick={(e) => {
              // Stop propagation to prevent double execution
              e.stopPropagation();
              // Then explicitly navigate to Price Calendar tab
              clickPriceCalendarTab();
            }}
          >
            {uniqueDepartureAirports.map((airport, idx) => (
              <Option key={airport._id} value={airport._id}>
                {airport.name} ({airport.code})
              </Option>
            ))}
          </Select>
        </div>

        {/* Number of Travelers (Plus/Minus) */}
        <div 
          onClick={(e) => {
            e.stopPropagation();
            handlePriceCardInteraction();
          }}
          className={isMobileView ? "" : "mb-2"}
        >
          <Typography
            variant="small"
            className="font-medium text-gray-700 mb-2 customfontstitle"
          >
            Number of Travelers
          </Typography>
          <div className="flex items-center w-full border border-gray-300 rounded-md p-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDecrement();
              }}
              className="px-3 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              -
            </button>
            <span className="flex-1 text-center font-medium customfontstitle">
              {adultCount} Adults
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleIncrement();
              }}
              className="px-3 py-1 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div 
          className="flex items-center justify-between pt-2 cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            handlePriceCardInteraction();
          }}
        >
          <Typography
            variant="small"
            className="font-medium text-gray-700 customfontstitle"
          >
            Total Price:
          </Typography>
          <Typography
            variant={isMobileView ? "h6" : "h5"}
            className="font-bold tracking-wide bg-transparent bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 customfontstitle"
          >
            ${totalPrice}
          </Typography>
        </div>
      </CardBody>

      {/* Footer: Button & Contact Info */}
      <CardFooter className={`p-4 pt-2 space-y-4 ${isMobileView ? "py-3" : "px-5 py-5"}`}>
        <Button
          size={isMobileView ? "md" : "lg"}
          className="transition-colors duration-500 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-700 w-full normal-case text-white font-semibold customfontstitle py-3"
          onClick={handleSubmit}
        >
          Book Now
        </Button>
        {/* <Button
          size="lg"
          className="
    relative overflow-hidden bg-gray-200 w-full normal-case text-white font-semibold transition-all duration-[1000ms] ease-in-out
    hover:text-white group"
          onClick={handleSubmit}
        >
          <span
            className="
      absolute left-0 h-20 w-20 bg-[#e05c00] rounded-full transform -translate-x-1/2 -translate-y-1/2
      transition-all duration-[1000ms] ease-in-out
      group-hover:scale-[20] group-hover:w-full group-hover:h-full group-hover:rounded-none"
          ></span>
          <span className="relative z-10 text-deep-orange-600 transition-all duration-500 ease-in-out group-hover:text-white">
            Book Now
          </span>
        </Button> */}

        {/* <CalendarView
          dealId={dealId}
          dealtitle={dealtitle}
          adultCount={adultCount}
          departureDates={departureDates}
          departureAirports={departureAirports}
          priceMap={priceMap}
          setSelectedTrip={setSelectedTrip} 
          selectedAirport={selectedAirport}
        /> */}

        {/* Phone / Call to Book - Only show on desktop or if mobile with more space */}
        {(!isMobileView || windowHeight > 700) && (
          <div className="text-center">
            <Typography
              variant="small"
              className="text-gray-600 mb-1 customfontstitle"
            >
              Or call us to book:
            </Typography>
            <div>
              <a
                href="tel:+18000000000"
                className="flex items-center justify-center gap-2"
              >
                <FaPhoneAlt className="text-green-500" />
                <Typography
                  variant="large"
                  className="font-bold text-black customfontstitle"
                >
                  1 8** *** ****
                </Typography>
              </a>
            </div>
          </div>
        )}

        {/* Icons Row: Only show on desktop or if mobile with more space */}
        {(!isMobileView || windowHeight > 700) && (
          <div className="flex items-center justify-around text-xs text-gray-600 mt-2">
            <div className="flex flex-col items-center">
              <FaLock className="text-gray-800 text-lg mb-1" />
              <span>Secure Booking</span>
            </div>
            <div className="flex flex-col items-center">
              <FaMoneyBillWave className="text-gray-800 text-lg mb-1" />
              <span>Flexible Payment</span>
            </div>
            <div className="flex flex-col items-center">
              <FaHeadphonesAlt className="text-gray-800 text-lg mb-1" />
              <span>24/7 Support</span>
            </div>
          </div>
        )}

        {/* Airport Prices List */}
        {prices && prices.length > 0 && (!isMobileView || windowHeight > 700) && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <Typography variant="small" className="font-semibold text-gray-800 mb-3 customfontstitle">
              Lowest price from selected airport
            </Typography>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
              {(() => {
                // Process prices to find cheapest price for each unique airport
                const airportPriceMap = {};
                prices.forEach(priceItem => {
                  if (priceItem.airport && priceItem.price) {
                    const airportId = priceItem.airport._id;
                    if (!airportPriceMap[airportId] || airportPriceMap[airportId].price > priceItem.price) {
                      airportPriceMap[airportId] = {
                        airport: priceItem.airport,
                        price: priceItem.price
                      };
                    }
                  }
                });
                
                // Convert to array and sort by price (cheapest first)
                const sortedAirports = Object.values(airportPriceMap).sort((a, b) => a.price - b.price);
                
                return sortedAirports.map((item, index) => (
                  <div 
                    key={item.airport._id} 
                    className="flex items-center justify-between text-sm p-2 rounded cursor-pointer transition-shadow hover:shadow-md hover:bg-blue-50"
                    onClick={() => {
                      handleAirportChange(item.airport._id);
                    }}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-700">{item.airport.name}</div>
                      <div className="text-gray-500 text-sm">{item.airport.category}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-blue-600">${item.price}</span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </CardFooter>
      <Dialog
        open={openDialog}
        handler={() => setOpenDialog(false)}
        size={isMobile ? "md" : "xs"}
        className="p-0 bg-transparent"
      >
        <DialogBody className="overflow-auto max-h-[90vh] flex justify-center">
          <div className="w-full">
            <ConciergeFormCard
              dealId={dealId}
              dealtitle={dealtitle}
              adultCount={adultCount}
              totalPrice={totalPrice}
              selectedDate={selectedDate}
              airport={selectedAirport}
              handleClose={() => setOpenDialog(false)}
            />
          </div>
        </DialogBody>
      </Dialog>
    </Card>
  );
};

export default FilterElement;
