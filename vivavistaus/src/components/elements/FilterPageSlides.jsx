import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import TermsAndConditions from "../pages/TermsAndConditions";
import Itinerary from "./Itinerary";
import Overview from "./Overview";
import PriceCalendar from "./PriceCalendarCard";

// ✅ Memoized components
const OverviewComponent = React.memo(({ tripData, availableCountries, whatsIncluded, exclusiveAdditions, termsAndConditions, hotels, selectedPlaces }) => (
  <div className="md:p-4">
    <Overview
      tripData={tripData}
      availableCountries={availableCountries}
      whatsIncluded={whatsIncluded}
      exclusiveAdditions={exclusiveAdditions}
      termsAndConditions={termsAndConditions}
      hotels={hotels}
      selectedPlaces={selectedPlaces}
    />
  </div>
));

const ItineraryComponent = React.memo(({ itinerary, openDays, setOpenDays }) => (
  <div className="md:p-4">
    <Itinerary itinerary={itinerary} openDays={openDays} setOpenDays={setOpenDays} />
  </div>
));

const PriceCalendarComponent = React.memo(({
  prices,
  onTripSelect,
  departureDates,
  departureAirports,
  priceMap,
  pricesid,
  selectedAirport,
  setLedprice,
}) => (
  <div className="md:p-4">
    <PriceCalendar
      prices={prices}
      onTripSelect={onTripSelect}
      departureDates={departureDates}
      departureAirports={departureAirports}
      priceMap={priceMap}
      pricesid={pricesid}
      selectedAirport={selectedAirport}
      setLedprice={setLedprice}
    />
  </div>
));

const TermsComponent = React.memo(() => (
  <div className="md:p-4 customfontstitle">
    <TermsAndConditions />
  </div>
));

const FilterPageSlides = ({
  tripData,
  itinerary,
  prices,
  priceswitch,
  hotels,
  availableCountries,
  exclusiveAdditions,
  termsAndConditions,
  whatsIncluded,
  selectedTrip,
  setLedprice,
  pricesid,
  Airport,
  setSelectedTrip,
  setSelectedDate,
  setSelectedAirport,
  departureDates,
  departureAirports,
  priceMap,
  activeTab,
  setActiveTab,
  selectedPlaces,
}) => {
  // Remove local activeTab state since it's now controlled by the parent
  // const [activeTab, setActiveTab] = useState("overview");
  const [openDays, setOpenDays] = useState(() => itinerary?.map(() => false) || []);

  // Listen for the custom event to switch tabs
  useEffect(() => {
    const handleSwitchTab = (event) => {
      console.log("Received custom event:", event.detail);
      if (event.detail && event.detail.tabName) {
        console.log("Switching to tab:", event.detail.tabName);
        setActiveTab(event.detail.tabName);
      }
    };

    // Add event listener
    document.addEventListener('switchToPriceCalendar', handleSwitchTab);

    // Clean up
    return () => {
      document.removeEventListener('switchToPriceCalendar', handleSwitchTab);
    };
  }, [setActiveTab]);

  const handleTripSelect = useCallback((trip) => {
    setSelectedTrip(trip);
    setSelectedDate(
      trip.startdate ? new Date(trip.startdate).toLocaleDateString("en-GB") : ""
    );
    setSelectedAirport(trip.airport);
  }, [setSelectedTrip, setSelectedDate, setSelectedAirport]);

  // Render only active tab content
  const renderTabContent = useMemo(() => {
    switch (activeTab) {
      case "overview":
        return (
          <OverviewComponent
            tripData={tripData}
            availableCountries={availableCountries}
            whatsIncluded={whatsIncluded}
            exclusiveAdditions={exclusiveAdditions}
            termsAndConditions={termsAndConditions}
            hotels={hotels}
            selectedPlaces={selectedPlaces}
          />
        );
      case "itinerary":
        return (
          <ItineraryComponent
            itinerary={itinerary}
            openDays={openDays}
            setOpenDays={setOpenDays}
          />
        );
      case "price-calendar":
        return (
          <PriceCalendarComponent
            prices={prices}
            onTripSelect={handleTripSelect}
            departureDates={departureDates}
            departureAirports={departureAirports}
            priceMap={priceMap}
            pricesid={pricesid}
            selectedAirport={Airport}
            setLedprice={setLedprice}
          />
        );
      case "terms":
        return <TermsComponent />;
      default:
        return null;
    }
  }, [
    activeTab,
    tripData,
    itinerary,
    openDays,
    prices,
    handleTripSelect,
    departureDates,
    departureAirports,
    priceMap,
    pricesid,
    Airport,
    setLedprice,
    availableCountries,
    whatsIncluded,
    exclusiveAdditions,
    termsAndConditions,
    hotels,
    selectedPlaces,
  ]);

  return (
    <div className="w-full flex justify-center">
      <div className="w-full border rounded-lg shadow-lg overflow-hidden">
        <Tabs value={activeTab}>
          <TabsHeader
            className="bg-gray-200 p-2 overflow-x-auto rounded-b-none whitespace-nowrap flex-nowrap"
            indicatorProps={{
              className:
                "bg-transparent border-b-2 border-deep-orange-600 font-semibold",
            }}
          >
            {[
              { label: "Overview", value: "overview" },
              { label: "Itinerary", value: "itinerary" },
              { label: "Price Calendar", value: "price-calendar" },
              { label: "Terms and Conditions", value: "terms" },
            ].map(({ label, value }) => (
              <Tab
                key={value}
                value={value}
                id={`tab-${value}`}
                onClick={() => setActiveTab(value)}
                className={
                  activeTab === value
                    ? "text-deep-orange-500 z-0 customfontstitle"
                    : "z-0 customfontstitle"
                }
              >
                {label}
              </Tab>
            ))}
          </TabsHeader>
          <div className="h-[600px] overflow-y-auto p-1 md:p-4">
            <TabsBody>
              <TabPanel value={activeTab}>{renderTabContent}</TabPanel>
            </TabsBody>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default FilterPageSlides;
