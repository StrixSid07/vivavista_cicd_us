import React, { useEffect, useState } from "react";
import { Navbar, Footer, CardOver, SpeedDiel } from "./defaults";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import {
  Blogs,
  ContactUs,
  Services,
  AboutUs,
  BlogDetail,
  FaqsAccordion,
  PrivacyPolicy,
  TermsAndConditions,
  CookiePolicy,
  FilterPage,
  TopDeals,
  Packages,
  GroupBookingForm,
  Holidays,
  Destinations,
  MulticenterPage,
} from "./pages";
import { MainScreen } from "./screens";
import TravelFilter from "./elements/TravelFilter";
import { SubscribePopup } from "./elements";

const Main = () => {
  const [scrollY, setScrollY] = useState(0);
  const [hideExtraNavbar, setHideExtraNavbar] = useState(false);
  const isMobileOrTablet = useMediaQuery({ query: "(max-width: 1024px)" });
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY === 0) {
        // At the top of the page
        setHideExtraNavbar(false);
      } else if (currentScrollY > scrollY) {
        // Scrolling down
        setHideExtraNavbar(true);
      }

      setScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollY]);

  return (
    <Router>
      <div className="overflow-x-hidden relative">
        {/* <div
          className={`fixed w-full z-50 bg-[#2E4A42] ${
            // Only hide ExtraNavbar if hideExtraNavbar is true and the device is larger than tablet
            hideExtraNavbar && !isMobileOrTablet
              ? "transition-transform duration-300 ease-in-out -translate-y-full"
              : ""
          }`}
        >
          <ExtraNavbar />
        </div> */}

        {/* <div
          className={`fixed w-full z-40 ${
            // For mobile/tablet, always position Navbar below ExtraNavbar (e.g., top-[30px])
            isMobileOrTablet
              ? "top-[30px]"
              : hideExtraNavbar
              ? "top-0 transition-transform duration-300 ease-in-out"
              : "top-[30px]"
          }`}
        >
          <Navbar />
        </div> */}

        <div className="fixed w-full z-40 top-0">
          <Navbar />
        </div>

        <div className="md:mt-[80px] mt-24">
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/search" element={<TravelFilter />} />
            <Route path="/beachholidays" element={<MainScreen />} />
            <Route path="/citybreakes" element={<MainScreen />} />
            <Route path="/luxaryholidays" element={<MainScreen />} />
            <Route path="/europe" element={<MainScreen />} />
            <Route path="/asia" element={<MainScreen />} />
            <Route path="/caribbean" element={<MainScreen />} />
            <Route path="/middleeast" element={<MainScreen />} />
            <Route path="/OurServices" element={<Services />} />
            <Route path="/AboutUs" element={<AboutUs />} />
            <Route path="/faq" element={<FaqsAccordion />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/termsandcondition" element={<TermsAndConditions />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/deals/:id" element={<FilterPage />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/topdeals" element={<TopDeals />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/vacations/:name" element={<Holidays />} />
            <Route path="/destinations/:name" element={<Destinations />} />
            <Route path="/multicenter" element={<MulticenterPage />} />
            <Route path="/groupbooking" element={<GroupBookingForm />} />
            <Route path="/ContactUs" element={<ContactUs />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            {/* Catch-all route for unmatched paths */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        <div className="z-20 mt-20 -mb-28 flex flex-col justify-center items-center p-4 md:p-0">
          <CardOver />
        </div>
        <Footer />
        {/* <FooterNew /> */}
        {/* Fixed SpeedDiel Button */}
        <div className="fixed right-0 md:right-0 top-1/2 transform -translate-y-1/2 z-[1000]">
          <SpeedDiel />
        </div>
        
        {/* Subscribe Popup */}
        <SubscribePopup />
      </div>
    </Router>
  );
};

export default Main;
