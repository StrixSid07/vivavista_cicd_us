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
  const [didSetInitialMonth, setDidSetInitialMonth] = useState(false);
  const [lastAirport, setLastAirport] = useState(null);
  const { dealIdform } = useContext(LeadContext);
  const { adultCount } = useContext(LeadContext);
  const parsedDates = useMemo(() => {
    console.log("========== 🔍 parsedDates Debugging =============");
    console.log("🛫 selectedAirport:", selectedAirport);
    console.log("📦 departureAirports:", departureAirports);
    console.log("📅 departureDates:", departureDates);
    console.log("🔑 pricesid:", pricesid);
    console.log("💰 priceMap keys:", Object.keys(priceMap));
    console.log("🧪 priceswitch:", priceswitch);

    const sortedDates = departureDates
      .map((d) => dayjs(d, "DD/MM/YYYY"))
      .sort((a, b) => (a.isBefore(b) ? -1 : 1));

    console.log(
      "✅ sortedDates:",
      sortedDates.map((d) => d.format("DD/MM/YYYY"))
    );

    const allParsedDates = sortedDates.map((date, i) => {
      const formattedDate = date.format("DD/MM/YYYY");
      const idprice = pricesid[i];
      const fullKey = `${formattedDate}_${idprice}`;
      const price = priceMap[fullKey] || 0;

      const airportArray = departureAirports[i % departureAirports.length];
      const airport =
        Array.isArray(airportArray) && airportArray.length > 0
          ? airportArray[0]
          : airportArray;

      console.log(`📌 Entry ${i}: ${formattedDate}`);
      console.log("  └ fullKey:", fullKey);
      console.log("  └ airportId:", airport?._id);
      console.log("  └ price:", price);

      return {
        date,
        airport,
        price,
      };
    });

    console.log(
      "📊 allParsedDates:",
      allParsedDates.map((d) => ({
        date: d.date.format("DD/MM/YYYY"),
        airportId: d.airport?._id,
        price: d.price,
      }))
    );

    const finaldata = allParsedDates.filter((d) => {
      const match = d.airport && d.airport._id === selectedAirport;
      console.log(`🧹 Filter by airport | ${d.date.format("DD/MM/YYYY")}:`, {
        airport: d.airport?._id,
        match,
      });
      return match;
    });

    console.log(
      "✅ Filtered by selectedAirport:",
      finaldata.map((d) => ({
        date: d.date.format("DD/MM/YYYY"),
        airportId: d.airport?._id,
        price: d.price,
      }))
    );

    const finaltwo = finaldata.filter((d) => {
      if (!d.price) {
        console.log("⛔ No price found for:", d);
        return false;
      }

      if (typeof d.price === "object") {
        const flag = d.price.priceswitch;
        console.log(`⚙️ Price Object Check | ${d.date.format("DD/MM/YYYY")}:`, {
          value: d.price.value,
          priceswitch: flag,
        });
        return flag === false;
      } else {
        console.log(
          `✅ Price as number | ${d.date.format("DD/MM/YYYY")}: ${d.price}`
        );
        return true;
      }
    });

    console.log(
      "✅ After priceswitch filter:",
      finaltwo.map((d) => ({
        date: d.date.format("DD/MM/YYYY"),
        airportId: d.airport?._id,
        price: d.price,
      }))
    );

    const finalThree = finaltwo.map((d) => {
      const { price, ...rest } = d;
      let finalPrice;
      if (typeof price === "object") {
        finalPrice = price.value || price.price || 0;
      } else {
        finalPrice = price;
      }

      return {
        ...rest,
        price: finalPrice,
      };
    });

    console.log(
      "✅ finalThree (cleaned prices):",
      finalThree.map((d) => ({
        date: d.date.format("DD/MM/YYYY"),
        airportId: d.airport?._id,
        price: d.price,
      }))
    );
    console.log("==============================================");

    return finalThree;
  }, [departureDates, departureAirports, priceMap, selectedAirport, pricesid]);
  

  console.log("parsh data", parsedDates);
  
  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  useEffect(() => {
    if (!parsedDates || parsedDates.length === 0) return;

    // Only trigger when airport changes
    if (selectedAirport !== lastAirport) {
      const firstValidDate = parsedDates.find((d) => d && d.date && d.price);
      if (firstValidDate) {
        const newMonth = firstValidDate.date.startOf("month");
        console.log(
          "Airport changed: resetting calendar to",
          newMonth.format("MMMM YYYY")
        );
        setCurrentMonth(newMonth);
        setLastAirport(selectedAirport); // update the tracked airport
      }
    }
  }, [selectedAirport, parsedDates]);
  
  // Update currentMonth when parsedDates changes to show the first month with data
  useEffect(() => {
    if (
      didSetInitialMonth ||
      !Array.isArray(parsedDates) ||
      parsedDates.length === 0
    )
      return;

    const firstValidDate = parsedDates.find((d) => d && d.date && d.price);
    if (firstValidDate) {
      const newMonth = firstValidDate.date.startOf("month");
      console.log("Setting initial month to:", newMonth.format("MMMM YYYY"));
      setCurrentMonth(newMonth);
      setDidSetInitialMonth(true); // Prevent future resets
    }
  }, [parsedDates, didSetInitialMonth]);

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
