import React, { useState, useMemo, useEffect, useContext } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import { Dialog, DialogBody } from "@material-tailwind/react";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ConciergeFormCard from "./ConciergeFormCard";
import { LeadContext } from "../../contexts/LeadContext";
dayjs.extend(customParseFormat);

const CalendarView = ({
  departureDates,
  pricesid,
  departureAirports,
  priceMap,
  dealId,
  dealtitle,
  setSelectedTrip,
  priceswitch,
  setLedprice,
  selectedAirport,
}) => {
  const { leadPrice, setLeadPrice } = useContext(LeadContext);
  console.log("this is deal id from clendercard", dealId);
  const { dealIdform } = useContext(LeadContext);
  const { adultCount } = useContext(LeadContext);
  const parsedDates = useMemo(() => {
    // Parse and sort the dates using the provided "DD/MM/YYYY" format
    // console.log("this is selected airport", selectedAirport);
    // console.log("this is departure airports", departureAirports);
    console.log("priceswitch", priceswitch);
    console.log("price map", priceMap);
    console.log("this is despature date", departureDates);
    console.log("this is id's", pricesid);
    const sortedDates = departureDates
      .map((d) => dayjs(d, "DD/MM/YYYY"))
      .sort((a, b) => (a.isBefore(b) ? -1 : 1));
    console.log("this is sortedDates ", sortedDates);
    console.log("this is airpot", departureAirports);

    // Map each sorted date with its airport and price from the priceMap using the same format
    const allParsedDates = sortedDates.map((date, i) => {
      const formattedDate = date.format("DD/MM/YYYY");

      const idprice = pricesid[i];
      const fullKey = `${formattedDate}_${idprice}`;

      // Safely access the airport, ensuring it exists and has the expected structure
      const airportArray = departureAirports[i % departureAirports.length];
      const airport = Array.isArray(airportArray) && airportArray.length > 0 ? airportArray[0] : airportArray;
      
      return {
        date,
        airport,
        price: priceMap[fullKey] || 0,
      };
    });

    console.log("this is all parsed dates", allParsedDates);
    
    // Filter out entries with invalid airports and then filter by selected airport
    const finaldata = allParsedDates.filter(
      (d) => d.airport && d.airport._id && d.airport._id === selectedAirport
    );
    
    console.log("this is all finaldata", finaldata);
    
    // Safely filter by priceswitch, ensuring price object has the expected structure
    const finaltwo = finaldata.filter((d) => {
      // Check if price exists and has the expected structure
      if (!d.price) {
        console.log("No price object found for:", d);
        return false;
      }
      
      // Handle different price object structures
      if (typeof d.price === 'object') {
        // If price is an object, check the priceswitch property
        const priceswitch = d.price.priceswitch;
        console.log("Price object:", d.price, "priceswitch:", priceswitch);
        return priceswitch === false;
      } else {
        // If price is just a number, include it (assume no priceswitch means it's valid)
        console.log("Price is a number:", d.price);
        return true;
      }
    });

    console.log("this is final two", finaltwo);
    
    const finalThree = finaltwo.map((d) => {
      // Destructure the price object and remove the 'priceswitch' field
      const { price, ...rest } = d;
      
      let finalPrice;
      if (typeof price === 'object' && price !== null) {
        // If price is an object, extract the value
        finalPrice = price.value || price.price || 0;
        console.log("Extracting price from object:", price, "final price:", finalPrice);
      } else {
        // If price is already a number, use it directly
        finalPrice = price;
        console.log("Using price directly:", finalPrice);
      }
      
      return {
        ...rest, // Keep all other properties (e.g., airport, date)
        price: finalPrice, // Use the extracted price value
      };
    });

    console.log("finalThree result:", finalThree);
    return finalThree; // Compare by _id
  }, [departureDates, departureAirports, priceMap, selectedAirport, pricesid]);

  console.log("parsh data", parsedDates);
  
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  
  // Update currentMonth when parsedDates changes to show the first month with data
  useEffect(() => {
    if (!Array.isArray(parsedDates) || parsedDates.length === 0) return;
    
    // Find the first date that has valid data
    const firstValidDate = parsedDates.find(d => d && d.date && d.price);
    if (firstValidDate) {
      const newMonth = firstValidDate.date.startOf("month");
      console.log("Setting month to:", newMonth.format("MMMM YYYY"));
      setCurrentMonth(newMonth);
    }
  }, [parsedDates]);

  const dateMap = useMemo(() => {
    const map = {};
    
    console.log("Creating dateMap from parsedDates:", parsedDates);
    
    if (!Array.isArray(parsedDates)) {
      console.log("parsedDates is not an array:", parsedDates);
      return map;
    }
    
    parsedDates.forEach(({ date, airport, price }, index) => {
      console.log(`Processing item ${index}:`, { date, airport, price });
      
      if (!date) {
        console.log("No date found for item:", { date, airport, price });
        return;
      }
      
      const key = date.format("DD/MM/YYYY");
      console.log("Date key:", key);
      
      if (!map[key]) map[key] = [];
      
      // Only add entries with valid airport and price
      if (airport && price !== undefined) {
        map[key].push({ airport, price });
        console.log(`Added to dateMap[${key}]:`, { airport, price });
      } else {
        console.log("Skipping item due to missing airport or price:", { airport, price });
      }
    });
    
    console.log("Final dateMap:", map);
    return map;
  }, [parsedDates]);

  const priceswitchDates = useMemo(() => {
    const map = new Map();

    if (!priceswitch || !Array.isArray(priceswitch)) return map;

    priceswitch.forEach((item) => {
      if (!item || !item.priceswitch) return;

      const formattedStartDate = item.startdate ? dayjs(item.startdate).format("DD/MM/YYYY") : null;
      
      // Safely access airport ID
      let airportId = null;
      if (item.airport) {
        if (Array.isArray(item.airport) && item.airport.length > 0) {
          const airport = item.airport[0];
          airportId = airport && typeof airport === 'object' ? airport._id : airport;
        } else if (typeof item.airport === 'object') {
          airportId = item.airport._id;
        } else {
          airportId = item.airport;
        }
      }

      if (formattedStartDate && airportId) {
        map.set(`${formattedStartDate}_${airportId}`, true);
      }
    });

    return map;
  }, [priceswitch]);

  console.log("this is priceswitchdatae prices", priceswitchDates);
  const startOfMonth = currentMonth.startOf("month");
  const endOfMonth = currentMonth.endOf("month");

  const startDay = startOfMonth.day(); // 0 (Sun) - 6 (Sat)
  const totalDays = endOfMonth.date();
  const days = [];

  for (let i = 0; i < startDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= totalDays; i++) {
    const date = currentMonth.date(i).format("DD/MM/YYYY");
    days.push({
      day: i,
      date,
      info: dateMap[date] || null,
    });
  }

  const handleMonthChange = (direction) => {
    if (!Array.isArray(parsedDates) || parsedDates.length === 0) return;
    
    const currentIndex = parsedDates.findIndex((d) =>
      d && d.date && d.date.isSame && d.date.isSame(currentMonth, "month")
    );
    
    if (currentIndex === -1) return;

    let target;
    if (direction === "prev") {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (parsedDates[i] && parsedDates[i].date && 
            !parsedDates[i].date.isSame(currentMonth, "month")) {
          target = parsedDates[i].date;
          break;
        }
      }
    } else if (direction === "next") {
      for (let i = currentIndex + 1; i < parsedDates.length; i++) {
        if (parsedDates[i] && parsedDates[i].date && 
            !parsedDates[i].date.isSame(currentMonth, "month")) {
          target = parsedDates[i].date;
          break;
        }
      }
    }

    if (target) {
      setCurrentMonth(target.startOf("month"));
    }
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDayInfo, setSelectedDayInfo] = React.useState(null);

  // const handleSubmit = (info) => {
  //   setSelectedDayInfo(info);
  //   setOpenDialog(true);
  // };

  const handleSubmit = (day) => {
    setSelectedDayInfo(day); // `day` includes { day, date, info }
    setOpenDialog(true);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Adjust breakpoint as needed
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (!Array.isArray(parsedDates) || parsedDates.length === 0) return;

    const datesInCurrentMonth = parsedDates.filter((d) =>
      d && d.date && d.date.isSame && d.date.isSame(currentMonth, "month")
    );

    if (datesInCurrentMonth.length > 0) {
      // Make sure all prices are valid numbers
      const validPrices = datesInCurrentMonth
        .map((d) => d.price)
        .filter(price => typeof price === 'number' && !isNaN(price));
      
      if (validPrices.length > 0) {
        const lowestPrice = Math.min(...validPrices);
        if (typeof setLeadPrice === 'function') {
          setLeadPrice(lowestPrice);
        }
      }
    }
  }, [currentMonth, parsedDates, setLeadPrice]);

  return (
    <div className="max-w-sm mx-auto p-2 bg-white rounded-xl shadow-md overflow-hidden">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex justify-between items-center rounded-md">
        <button
          onClick={() => handleMonthChange("prev")}
          className="bg-white text-blue-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-blue-100"
        >
          ←
        </button>
        <h2 className="text-lg font-bold text-white">
          {currentMonth.format("MMMM YYYY")}
        </h2>
        <button
          onClick={() => handleMonthChange("next")}
          className="bg-white text-blue-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md hover:bg-blue-100"
        >
          →
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7 text-center text-sm font-medium my-2 text-gray-600">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* Days grid */}
      {/* <div className="grid grid-cols-7 gap-1 text-xs p-2">
        {days.map((day, i) =>
          day ? (
            <div
              key={i}
              // onClick={day.info ? () => handleSubmit(day.info) : undefined}
              onClick={day.info ? () => handleSubmit(day) : undefined}
              className={clsx(
                "p-2 rounded-md text-center border",
                day.info
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md cursor-pointer"
                  : "text-gray-400",
                day.date === dayjs().format("DD/MM/YYYY") &&
                  "border-2 border-yellow-500"
              )}
            >
              <div className="font-medium">{day.day}</div>
              {day.info && (
                <div className="mt-1 flex flex-col justify-center  items-center">
                  <div className="text-xs font-normal">${day.info.price}</div>
                  <div className="text-[0.68rem]">{day.info.airport?.code}</div>
                  {day.info &&
                    priceswitchDates.get(
                      `${day.date}_${day.info.airport?._id}`
                    ) && (
                      <div className="text-[0.6rem] text-green-500 font-semibold">
                        ON
                      </div>
                    )}
                </div>
              )}
            </div>
          ) : (
            <div key={i} className="p-2" />
          )
        )}
      </div> */}
      {/* {parsedDates.some(
        (d) =>
          d.date.isSame(currentMonth, "month") &&
          priceswitchDates.get(
            `${d.date.format("DD/MM/YYYY")}_${d.airport._id}`
          )
      ) ? ( */}
      {/* // If any date in the current month has priceswitch ON, show this message card
       
    
        // Otherwise, show the full calendar grid */}
      <div className="grid grid-cols-7 gap-1 text-xs p-2">
        {days.map((day, i) => {
          if (!day) return <div key={i} className="p-2" />;
          return (
            <div
              key={i}
              onClick={day.info ? () => handleSubmit(day) : undefined}
              className={clsx(
                "p-2 rounded-md text-center border",
                day.info
                  ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md cursor-pointer"
                  : "text-gray-400",
                day.date === dayjs().format("DD/MM/YYYY") &&
                  "border-2 border-yellow-500"
              )}
            >
              <div className="font-medium">{day.day}</div>
              {day.info && (
                <div className="mt-1 flex flex-col items-center space-y-1">
                  {day.info.map((info, idx) => (
                    <div key={idx} className="text-xs text-white">
                      ${info.price}{" "}
                      <span className="text-[0.6rem]">
                        ({info.airport?.code})
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Dialog
        open={openDialog}
        handler={() => setOpenDialog(false)}
        size={isMobile ? "md" : "xs"}
        className="p-0 bg-transparent"
      >
        <DialogBody className="overflow-auto max-h-[90vh] flex justify-center">
          <div className="w-full customfontstitle">
            {/* <ConciergeFormCard
              handleClose={() => setOpenDialog(false)}
              // selectedInfo={selectedDayInfo}
            /> */}
            <ConciergeFormCard
              dealId={dealIdform}
              dealtitle={dealtitle}
              adultCount={adultCount}
              totalPrice={selectedDayInfo?.info?.[0]?.price}
              selectedDate={selectedDayInfo?.date}
              airport={selectedDayInfo?.info?.[0]?.airport?._id}
              handleClose={() => setOpenDialog(false)}
            />
          </div>
        </DialogBody>
      </Dialog>
    </div>
  );
};

export default CalendarView;
