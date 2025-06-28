import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { Switch } from "@material-tailwind/react";
import { AnimatePresence, motion } from "framer-motion";

const Itinerary = ({ itinerary, openDays, setOpenDays }) => {
  const allOpen = openDays.every(Boolean);

  const toggleDay = (idx) => {
    setOpenDays((prev) => prev.map((v, i) => (i === idx ? !v : v)));
  };

  const toggleAll = () => {
    setOpenDays(itinerary.map(() => !allOpen));
  };

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-4 customfontstitle">
        <h2 className="text-2xl font-semibold">Tour Plan</h2>
        <p className="text-gray-600 mt-2">No itinerary available.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 customfontstitle">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Tour Plan</h2>
        <div className="flex items-center gap-2">
          <Switch
            id="expand-all-switch"
            ripple={false}
            checked={allOpen}
            label="Expand all"
            onChange={toggleAll}
            className="h-full w-full checked:bg-blue-500"
            containerProps={{ className: "w-11 h-6" }}
            circleProps={{ className: "before:hidden left-0.5 border-none" }}
          />
        </div>
      </div>

      <div className="relative border-l-2 border-gray-200">
        {itinerary.map((day, idx) => {
          const isOpen = openDays[idx];
          const isFirst = idx === 0;
          const isLast = idx === itinerary.length - 1;

          return (
            <div key={idx} className="mb-6 pl-8 relative">
              {/* Timeline marker */}
              <div
                className={`absolute -left-5 top-1 p-2 rounded-full bg-blue-500 text-white z-10 ${
                  (!isFirst || !isLast) && "border-4 border-white"
                }`}
              >
                <FaMapMarkerAlt size={16} />
              </div>

              {/* Header */}
              <button
                onClick={() => toggleDay(idx)}
                className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
              >
                <span className="font-medium text-lg">
                  Day {String(idx + 1).padStart(2, "0")} : {day.title}
                </span>
                {isOpen ? (
                  <FiChevronUp className="text-gray-600" />
                ) : (
                  <FiChevronDown className="text-gray-600" />
                )}
              </button>

              {/* Animated Content */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key={`panel-${idx}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="py-2 text-gray-700">
                      {day.description && day.description.trim() && (
                        <p className="mb-3">{day.description}</p>
                      )}
                      {day.bulletpoints && day.bulletpoints.length > 0 && day.bulletpoints.some(bp => bp.trim()) && (
                        <div className={day.description && day.description.trim() ? "mt-3" : ""}>
                          <ul className="list-disc pl-5 space-y-1">
                            {day.bulletpoints.filter(bp => bp.trim()).map((bulletpoint, bpIndex) => (
                              <li key={bpIndex} className="text-sm text-gray-600">{bulletpoint}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {(!day.description || !day.description.trim()) && 
                       (!day.bulletpoints || day.bulletpoints.length === 0 || !day.bulletpoints.some(bp => bp.trim())) && (
                        <p>No details available.</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Itinerary;
