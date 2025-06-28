import React from "react";
import { format } from "date-fns";
import { Card, CardBody, CardHeader, Button } from "@material-tailwind/react";
import CalendarView from "./CalendarView";

const PriceCalendar = ({
  prices,
  onTripSelect,
  pricesid,
  departureDates,
  departureAirports,
  selectedAirport,
  priceMap,
  setLedprice,
}) => {
  const getFilteredPrices = () => {
    const uniqueCountries = [...new Set(prices.map((p) => p.country))];
    return uniqueCountries.length === 1
      ? prices
      : prices.filter((p) => p.country === "UK");
  };

  const filteredPrices = getFilteredPrices();
  console.log("this is filter data of card", filteredPrices);
  function getMonthName(date) {
    const options = { month: 'long' }; // 'long' for full month name, e.g. "January"
    return new Date(date).toLocaleString('en-GB', options); // 'en-GB' for English month name
  }
  
  return (
    <div className="space-y-8 md:px-0">
      <div className="text-center mb-4">
        <h2 className="text-xl md:text-4xl font-extrabold text-gray-900 customfontstitle">
          Choose Your Perfect Trip
        </h2>
        <p className="mt-2 text-gray-600 customfontstitle">
          Select a departure date and airport to see your best price.
        </p>
        <div className="flex customfontstitle">
          <CalendarView
            departureDates={departureDates}
            departureAirports={departureAirports}
            priceMap={priceMap}
            pricesid={pricesid}
            selectedAirport={selectedAirport}
            priceswitch={filteredPrices}
          />
        </div>
      </div>
      
  <h6 className="text-base md:text-xl font-medium text-gray-800 customfontstitle text-center mx-auto max-w-3xl leading-relaxed bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-100">
    Looking for different dates or months? Give us a call or drop us an email — we'll customize the perfect package just for you!
  </h6>
      <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 customfontstitle">
        {filteredPrices.map((trip, idx) => (
            trip.priceswitch ? (
          <Card
            key={idx}
            className="group transform transition-transform w-60 hover:scale-[1.02] shadow-lg hover:shadow-2xl border border-gray-200 rounded-2xl overflow-hidden"
          >
            <CardHeader
              floated={false}
              shadow={false}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-6"
            >
              {/* <h3 className="text-2xl font-semibold">
                {trip.country} — {trip.airport}
              </h3> */}
              <p className="mt-1 text-3xl font-bold tracking-tight">
                ${trip.price}
              </p>
            </CardHeader>

            {/* <CardBody className="p-6 space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Departure:</span>
                <span className="text-gray-900">
                  {trip.startdate
                    ? format(new Date(trip.startdate), "dd MMM yyyy")
                    : "TBA"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Airport:</span>
                <span className="text-gray-900">{trip.airport[0].code}</span>
              </div>
            </CardBody> */}

            <CardBody className="p-6 space-y-4 bg-white">
              {trip.priceswitch ? (
                <div className="text-center text-gray-700 font-medium mb-4">
                  Please contact us for this package's dates for month :-{getMonthName(trip.startdate)}.
                </div>
              ) : (
                <>
                  {/* <div className="flex items-start justify-between">
                    <span className="font-medium text-gray-700">
                      Departure:
                    </span>
                    <span className="text-gray-900">
                      {trip.startdate
                        ? format(new Date(trip.startdate), "dd MMM yyyy")
                        : "TBA"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Airport:</span>
                    <span className="text-gray-900">
                      {trip.airport[0].code}
                    </span>
                  </div> */}
                </>
              )}
            </CardBody>

            {/* <div className="p-6 bg-gray-50">
              <Button
                onClick={() => onTripSelect(trip)}
                className="w-full py-3 font-semibold normal-case tracking-wide transition-colors duration-500 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-700"
              >
                Select This Trip
              </Button>
            </div> */}
          </Card>
        ) : null
        ))}
      </div>
    
    </div>
  
  );
};

export default PriceCalendar;
