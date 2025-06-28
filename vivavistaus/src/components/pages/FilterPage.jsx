import React, { useEffect, useState, useRef, useContext, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { ImageGallery2, FilterElement, FilterPageSlides } from "../elements";
import {
  MapPin,
  Tag,
  CalendarCheck,
  Hotel,
  Flame,
  Sparkles,
  Share2,
} from "lucide-react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaWhatsapp, FaFacebook, FaCopy } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { Base_Url } from "../../utils/Api";
import SimilarDealsSlider from "../elements/SimilarDealsSlider";
import { LeadContext } from "../../contexts/LeadContext";

// Helper function to format destination text with places
const formatDestinationText = (primaryDestination, additionalDestinations, selectedPlaces) => {
  if (!primaryDestination && (!additionalDestinations || !additionalDestinations.length)) {
    return "Unknown Location";
  }
  
  // Create a map of all places from all destinations for easy lookup
  const allPlacesMap = {};
  
  // Add places from primary destination
  if (primaryDestination && primaryDestination.places && primaryDestination.places.length > 0) {
    primaryDestination.places.forEach(place => {
      allPlacesMap[place._id] = place.name;
    });
  }
  
  // Add places from additional destinations
  if (additionalDestinations && additionalDestinations.length > 0) {
    additionalDestinations.forEach(dest => {
      if (dest.places && dest.places.length > 0) {
        dest.places.forEach(place => {
          allPlacesMap[place._id] = place.name;
        });
      }
    });
  }
  
  // Create a map to associate selected places with destinations
  const selectedPlacesMap = {};
  
  // If selectedPlaces exists, organize them by destination
  if (selectedPlaces && selectedPlaces.length > 0) {

    selectedPlaces.forEach(place => {
      const destId = place.destinationId?._id || place.destinationId;
      if (!selectedPlacesMap[destId]) {
        selectedPlacesMap[destId] = [];
      }
      // Use the place name from allPlacesMap if available, otherwise use the ID
      const placeId = place.placeId?._id || place.placeId;
      const placeName = allPlacesMap[placeId] || place.placeId?.name || "Place";

      selectedPlacesMap[destId].push(placeName);
    });
  }
  
  // Format primary destination with its places using dash format
  let result = "";
  if (primaryDestination) {
    result = primaryDestination.name || primaryDestination;
    const primaryDestId = primaryDestination._id;
    if (selectedPlacesMap[primaryDestId] && selectedPlacesMap[primaryDestId].length > 0) {
      result += ` - ${selectedPlacesMap[primaryDestId].join(", ")}`;
    }
  }
  
  // Add additional destinations with their places using dash format
  if (additionalDestinations && additionalDestinations.length > 0) {
    const formattedDestinations = additionalDestinations.map(dest => {
      const destId = dest._id;
      const destName = dest.name;
      if (selectedPlacesMap[destId] && selectedPlacesMap[destId].length > 0) {
        return `${destName} - ${selectedPlacesMap[destId].join(", ")}`;
      }
      return destName;
    });
    
    if (result) {
      result += `, ${formattedDestinations.join(", ")}`;
    } else {
      result = formattedDestinations.join(", ");
    }
  }
  
  return result;
};

const FilterPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tripData, setTripData] = useState({});
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [prices, setPrices] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [exclusiveAdditions, setExclusiveAdditions] = useState([]);
  const [termsAndConditions, setTermsAndConditions] = useState([]);
  const [whatsIncluded, setWhatsIncluded] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const rating = hotels?.[0]?.tripAdvisorRating;
  const reviews = hotels?.[0]?.tripAdvisorReviews;
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [ledPrice, setLedprice] = useState(null); // State to store the lowest price
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedAirport, setSelectedAirport] = useState("");
  const leftCardRef = useRef(null);
  const [leftHeight, setLeftHeight] = useState("auto");
  const { setLeadPrice } = useContext(LeadContext);
  const [lowDepositOpen, setLowDepositOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showShareModal, setShowShareModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const shareUrl = window.location.href;

  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i + 1 <= Math.floor(rating)) {
        stars.push(<FaStar key={i} className="text-amber-500 text-sm" />);
      } else if (i < rating) {
        stars.push(
          <FaStarHalfAlt key={i} className="text-amber-500 text-sm" />
        );
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300 text-sm" />);
      }
    }

    return stars;
  };
  const [sharedData, setSharedData] = useState("Data from Parent");
  const updateSharedData = (newData) => {
    setSharedData(newData);
  };

  const [data, setData] = useState({
    basePrice: 479,
    departureDates: [],
    departureAirports: [],

  });

  // Function to find the cheapest price and its airport
  const findCheapestPrice = (pricesArray) => {
    if (!pricesArray || pricesArray.length === 0) return null;

    // Filter out any prices with priceswitch = true if needed
    const validPrices = pricesArray.filter(price => !price.priceswitch);

    if (validPrices.length === 0) return null;

    // Find the cheapest price
    const cheapestPrice = validPrices.reduce((cheapest, current) => {
      return current.price < cheapest.price ? current : cheapest;
    }, validPrices[0]);

    console.log("Found cheapest price:", cheapestPrice);
    return cheapestPrice;
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    axios
      .get(`${Base_Url}/deals/${id}`)
      .then((res) => {
        const data = res.data;
        console.log("this is fetch filter page data", data);
        console.log("Videos from API:", data.videos);
        console.log("Destination data:", data.destination);
        console.log("Additional destinations:", data.destinations);
        console.log("Selected places:", data.selectedPlaces);
        
        // Store the full destination data
        const fullDestination = data.destination;
        const fullDestinations = data.destinations || [];
        
        // Map trip details
        setTripData({
          title: data.title,
          tag: data.tag,
          description: data.description,
          destination: fullDestination,
          boardBasis: data.boardBasis,
          distanceToCenter: `${data.distanceToCenter} km`,
          distanceToBeach: `${data.distanceToBeach} km`,
          isTopDeal: data.isTopDeal,
          isHotdeal: data.isHotdeal,
          days: data.days,
          rooms: data.rooms,
          guests: data.guests,
          LowDeposite: data.LowDeposite,
          destinations: fullDestinations,
        });

        // Set images
        setImages(data.images || []);
        
        // Set videos (only include ready videos)
        setVideos(data.videos?.filter(video => video.status === "ready") || []);
        
        // Set selectedPlaces if available
        if (data.selectedPlaces && Array.isArray(data.selectedPlaces)) {
          setSelectedPlaces(data.selectedPlaces);
        }
        
        // Transform prices data
        setPrices(
          data.prices.map((price) => ({
            country: price.country,
            airport: price.airport,
            startdate: price.startdate,
            enddate: price.enddate,
            price: price.price,
            priceswitch: price.priceswitch,
            flightDetails: price.flightDetails,
            _id: price._id
          }))
        );

        // Set hotels array if exists
        if (data.hotels && Array.isArray(data.hotels)) {
          setHotels(
            data.hotels.map((hotel) => ({
              name: hotel.name,
              about: hotel.about,
              facilities: hotel.facilities,
              roomfacilities: hotel.roomfacilities,
              boardBasis: hotel.boardBasis,
              destination: hotel.destination,
              location: hotel.location,
              locationId: hotel.locationId,
              tripAdvisorRating: hotel.tripAdvisorRating,
              tripAdvisorReviews: hotel.tripAdvisorReviews,
              tripAdvisorPhotos: hotel.tripAdvisorPhotos,
              externalBookingLink: hotel.externalBookingLink,
              images: hotel.images,
              rooms: hotel.rooms,
              tripAdvisorLatestReviews: hotel.tripAdvisorLatestReviews,
              tripAdvisorLink: hotel.tripAdvisorLink,
              roomType: hotel.roomType,
            }))
          );
        }

        // Set available countries if exists
        if (data.availableCountries && Array.isArray(data.availableCountries)) {
          setAvailableCountries(data.availableCountries);
        }

        // Set exclusive additions if exists
        if (data.exclusiveAdditions && Array.isArray(data.exclusiveAdditions)) {
          setExclusiveAdditions(data.exclusiveAdditions);
        }

        // Set terms and conditions if exists
        if (data.termsAndConditions && Array.isArray(data.termsAndConditions)) {
          setTermsAndConditions(data.termsAndConditions);
        }

        // Set what's included if exists
        if (data.whatsIncluded && Array.isArray(data.whatsIncluded)) {
          setWhatsIncluded(data.whatsIncluded);
        }

        // Set itinerary if exists (note: your key is "iternatiy", so if that's intentional, use that)
        if (data.itinerary && Array.isArray(data.itinerary)) {
          setItinerary(data.itinerary);
        }

        // Find the cheapest price
        const cheapestPriceObj = findCheapestPrice(data.prices);
        if (cheapestPriceObj) {
          const formattedDate = new Date(cheapestPriceObj.startdate).toLocaleDateString("en-GB");
          console.log("Setting cheapest price:", cheapestPriceObj.price, "for date:", formattedDate);

          // Handle different airport data structures
          let airportId;
          if (cheapestPriceObj.airport && typeof cheapestPriceObj.airport === 'object') {
            airportId = cheapestPriceObj.airport._id;
          } else if (Array.isArray(cheapestPriceObj.airport) && cheapestPriceObj.airport.length > 0) {
            // If airport is an array, use the first one
            const firstAirport = cheapestPriceObj.airport[0];
            airportId = typeof firstAirport === 'object' ? firstAirport._id : firstAirport;
          } else {
            airportId = cheapestPriceObj.airport;
          }

          setSelectedDate(formattedDate);
          setSelectedAirport(airportId);
          setLeadPrice(cheapestPriceObj.price);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching deal data:", err);
        setLoading(false);
        // Don't redirect automatically, just show an error message in the component
      });
  }, [id, navigate, setLeadPrice]);

  useEffect(() => {
    const updateHeight = () => {
      if (window.innerWidth >= 768 && leftCardRef.current) {
        setLeftHeight(leftCardRef.current.offsetHeight);
      } else {
        setLeftHeight("auto");
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, [tripData]);

  const handleBookingSubmit = (bookingData) => {
    console.log("Submitted Booking Data:", bookingData);
  };
  const priceMap = prices.reduce((acc, p) => {
    const date = new Date(p.startdate).toLocaleDateString("en-GB"); // e.g., 07/05/2025
    const key = `${date}_${p._id}`; // Combine date and unique ID

    acc[key] = {
      value: p.price,
      priceswitch: p.priceswitch ?? false,
      pricesid: p._id,
    };

    return acc;
  }, {});

  // Function to switch to the Price Calendar tab
  const switchToPriceCalendarTab = useCallback(() => {
    setActiveTab("price-calendar");
  }, []);

  // Function to handle copying the URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="z-50 flex flex-col justify-center items-center w-full">
      <div className="">
        <div className="relative">
          <ImageGallery2 images={images} videos={videos} />
        </div>
        <div className="flex flex-col md:flex-row justify-between gap-2 items-start p-3 -mb-6 md:p-2 md:mb-0">
          <div
            ref={leftCardRef}
            className="bg-white border rounded-xl max-w-5xl w-full mx-auto mt-6 px-6 py-5 shadow-md relative"
          >
            {/* Top Deal Badge */}
            {tripData.isTopDeal && (
              <div className="absolute top-0 right-0 md:mt-0 md:mr-0 bg-yellow-400 text-sm font-semibold text-black px-3 py-1 rounded-tr-xl rounded-bl-xl flex items-center gap-1 shadow">
                <Sparkles className="w-4 h-4" />
                Top Deal
              </div>
            )}

            {/* Top Deal Badge */}
            {tripData.isHotdeal && (
              <div className="absolute top-0 right-0 md:mt-0 md:mr-0 shadow-md bg-orange-400 text-sm font-semibold text-black px-4 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-2">
                <Flame className="w-5 h-5" />
                Hot Deal
              </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              {/* LEFT SIDE */}
              <div className="md:flex hidden flex-col gap-2">
                {/* Title */}
                <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Hotel className="w-5 h-5 text-blue-500" />
                  {tripData.title || "Trip Title"}
                </div>

                {/* Details Row */}
                <div className="md:flex hidden flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-red-500" />
                    {(tripData.destinations && tripData.destinations.length > 0) || (selectedPlaces && selectedPlaces.length > 0) ? (
                      <span>
                        {formatDestinationText(tripData.destination, tripData.destinations, selectedPlaces)}
                      </span>
                    ) : (
                      tripData.destination?.name || "Unknown Location"
                    )}
                  </div>
                  {/* Only show tag if it exists and is not empty */}
                  {tripData.tag && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4 text-purple-500" />
                      {tripData.tag}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <CalendarCheck className="w-4 h-4 text-green-600" />
                    {tripData.days || 0} Nights
                  </div>
                  
                  {/* Share Button */}
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share This Deal
                  </button>
                </div>
              </div>

              <div className="mobile view">
                {" "}
                <div className="flex-1 flex md:hidden flex-col gap-1 mt-6 md:mt-0">
                  <div className="flex items-center gap-2 text-xl md:text-2xl font-semibold text-gray-800">
                    <Hotel className="w-6 h-6 text-blue-500" />
                    {tripData.title || "Trip Title"}
                  </div>
                </div>
                <div> </div>
                {/* Middle Section */}
                <div className="grid grid-cols-1 md:hidden gap-4 md:-mt-8 mt-3">
                  <div className="flex items-center gap-2 text-base text-gray-600">
                    <MapPin className="w-6 h-7 text-red-500" />
                    {(tripData.destinations && tripData.destinations.length > 0) || (selectedPlaces && selectedPlaces.length > 0) ? (
                      <span>
                        {formatDestinationText(tripData.destination, tripData.destinations, selectedPlaces)}
                      </span>
                    ) : (
                      tripData.destination?.name || "Unknown Location"
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-base text-gray-600">
                    <CalendarCheck className="w-6 h-7 text-green-600" />
                    {tripData.days || 0} Nights
                  </div>
                  {/* Only show tag if it exists and is not empty */}
                  {tripData.tag && (
                    <div className="flex items-center gap-2 text-base text-gray-600">
                      <Tag className="w-6 h-7 text-purple-500" />
                      {tripData.tag}
                    </div>
                  )}
                  
                  {/* Mobile Share Button */}
                  <button 
                    onClick={() => setShowShareModal(true)}
                    className="flex items-center gap-2 text-base text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Share2 className="w-6 h-6" />
                    Share This Deal
                  </button>
                </div>

                {/* Rating Section */}
                <div className="flex-1 flex md:hidden flex-col md:mt-8 mt-4 md:items-end gap-1">
                  <div className="flex items-center gap-1">
                    {rating ? (
                      <>
                        {renderStars()}
                        <span className="text-gray-800 text-base ml-1">
                          {rating.toFixed(1)} ({reviews} Reviews)
                        </span>
                      </>
                    ) : (
                      <span className="text-base text-gray-500 italic">
                        No reviews yet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="md:flex hidden items-center gap-2 mt-2 md:mt-8 text-sm text-gray-800">
                {rating ? (
                  <>
                    {renderStars()}
                    <span className="ml-1">
                      {rating.toFixed(1)} ({reviews} Reviews)
                    </span>
                  </>
                ) : (
                  <span className="italic text-gray-500">No reviews yet</span>
                )}
              </div>
            </div>
          </div>
          {/* for mobile view */}
          {tripData.LowDeposite && (
            <div
              className="bg-white border border-blue-500 rounded-xl max-w-sm w-full md:hidden md:h-[leftHeight] h-auto mx-auto mt-6 px-4 py-3 shadow-md relative flex flex-col"
              style={{ height: leftHeight }}
            >
              <h2 className="text-md font-semibold -mt-1 text-blue-500">
                Low Deposit
              </h2>
              <hr className="border-1 border-blue-500" />
              <div className="overflow-y-auto pr-2" style={{ flex: 1 }}>
                {tripData.LowDeposite}
              </div>
            </div>
          )}
          {/* for pc view */}
          {tripData.LowDeposite && (
            <>
              <button
                onClick={() => setLowDepositOpen(true)}
                className="bg-white border border-blue-500 rounded-xl max-w-sm w-full md:flex hidden items-center justify-center mx-auto mt-6 px-4 py-3 shadow-md hover:bg-blue-50 transition-colors"
                style={{ height: "fit-content" }}
            >
                <span className="text-md font-semibold text-blue-500">
                Low Deposit
                </span>
              </button>
              
              {/* Low Deposit Popup */}
              {lowDepositOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                  <div className="relative bg-white rounded-xl max-w-lg w-full p-6 shadow-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold text-blue-500">Low Deposit</h2>
                      <button 
                        onClick={() => setLowDepositOpen(false)}
                        className="text-gray-500 hover:text-gray-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="overflow-y-auto max-h-96">
                {tripData.LowDeposite}
              </div>
            </div>
                </div>
              )}
            </>
          )}

          {/* Airport Price List Section */}
          {/* {prices && prices.length > 0 && (
            <div className="bg-white border rounded-xl max-w-5xl w-full mx-auto mt-6 px-6 py-5 shadow-md">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Available Airports & Prices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                    <div key={item.airport._id} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-800 text-sm">{item.airport.name}</div>
                          <div className="text-xs text-gray-600">{item.airport.code} • {item.airport.category}</div>
                          {index === 0 && (
                            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
                              Best Price
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">${item.price}</div>
                          <div className="text-xs text-gray-500">per person</div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )} */}
        </div>
      </div>
      <div className="relative z-0 grid md:grid-cols-[2fr_1fr] grid-cols-1 gap-4 p-4 lg:p-6 mt-8 w-full max-w-7xl mx-auto items-start">
        {/* Mobile Price Card (Only visible on mobile) */}
        <div className="md:hidden w-full mb-6">
          <FilterElement
            dealId={id}
            sharedData={sharedData}
            updateSharedData={updateSharedData}
            dealtitle={tripData.title || " "}
            setSelectedTrip={setSelectedTrip}
            departureDates={prices.map((p) =>
              new Date(p.startdate).toLocaleDateString("en-GB")
            )}
            departureAirports={prices.map((p) => p.airport)}
            selectedDate={selectedDate}
            selectedAirport={selectedAirport}
            onBookingSubmit={handleBookingSubmit}
            onDateChange={setSelectedDate}
            onAirportChange={setSelectedAirport}
            priceMap={priceMap}
            prices={prices}
            switchToPriceCalendarTab={switchToPriceCalendarTab}
          />
        </div>
        
        {/* Left Side: Slides + Similar Deals */}
        <div className="flex flex-col gap-6 w-full max-w-4xl md:pr-4">
          <div className="rounded-xl shadow-md relative z-20">
            <FilterPageSlides
              tripData={tripData}
              itinerary={itinerary}
              prices={prices}
              hotels={hotels}
              Airport={selectedAirport}
              availableCountries={availableCountries}
              exclusiveAdditions={exclusiveAdditions}
              termsAndConditions={termsAndConditions}
              whatsIncluded={whatsIncluded}
              selectedTrip={selectedTrip}
              setSelectedTrip={setSelectedTrip}
              setSelectedDate={setSelectedDate}
              setSelectedAirport={setSelectedAirport}
              departureDates={prices.map((p) =>
                new Date(p.startdate).toLocaleDateString("en-GB")
              )}
              pricesid={prices.map((p) => p._id)}
              departureAirports={prices.map((p) => p.airport)}
              priceMap={priceMap}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectedPlaces={selectedPlaces}
            />
          </div>
          <div className="rounded-xl relative overflow-x-hidden shadow-md bg-gray-200 z-10">
            <SimilarDealsSlider
              destinationId={tripData.destination._id}
              dealId={id}
            />
          </div>
        </div>

        {/* Right Side: Filter Element (Only visible on desktop) */}
        <div className="w-full h-fit relative z-0 customfontstitle hidden md:block md:pl-4 md:self-start">
          <FilterElement
            dealId={id}
            sharedData={sharedData}
            updateSharedData={updateSharedData}
            dealtitle={tripData.title || " "}
            setSelectedTrip={setSelectedTrip}
            departureDates={prices.map((p) =>
              new Date(p.startdate).toLocaleDateString("en-GB")
            )}
            departureAirports={prices.map((p) => p.airport)}
            selectedDate={selectedDate}
            selectedAirport={selectedAirport}
            onBookingSubmit={handleBookingSubmit}
            onDateChange={setSelectedDate}
            onAirportChange={setSelectedAirport}
            priceMap={priceMap}
            prices={prices}
            switchToPriceCalendarTab={switchToPriceCalendarTab}
          />
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative bg-white rounded-xl max-w-md w-full p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-blue-500">Share With Friends</h2>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Sharing link</p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={shareUrl} 
                  readOnly 
                  className="flex-1 border rounded-md px-3 py-2 text-sm bg-gray-50"
                />
                <button 
                  onClick={handleCopyLink}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center gap-1"
                >
                  <FaCopy size={16} />
                  {copySuccess ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">Or share on</p>
            <div className="flex justify-center gap-4">
              <a 
                href={`https://wa.me/?text=${encodeURIComponent(`Check out this amazing deal: ${tripData.title} ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full"
              >
                <FaWhatsapp size={24} />
              </a>
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full"
              >
                <FaFacebook size={24} />
              </a>
              <a 
                href={`mailto:?subject=Check out this amazing deal: ${encodeURIComponent(tripData.title)}&body=${encodeURIComponent(`I found this amazing deal and thought you might be interested: ${shareUrl}`)}`}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
              >
                <MdEmail size={24} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPage;
