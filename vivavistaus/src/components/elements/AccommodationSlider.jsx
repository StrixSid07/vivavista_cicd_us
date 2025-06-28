// Example in AccommodationSlider.jsx
import React, { useRef, useState } from "react";
import AccommodationCard from "./AccommodationCardWithDrawer";

export const AccommodationSlider = ({ hotels }) => {
  if (!hotels || hotels.length === 0) return null;

  const sliderRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX || e.touches?.[0]?.pageX || 0);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = "grabbing";
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX || e.touches?.[0]?.pageX || 0;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = "grab";
    }
  };

  return (
    <div className="mt-4 select-none">
      <div 
        ref={sliderRef}
        className="flex space-x-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide cursor-grab"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {hotels.map((hotel) => (
          <div key={hotel._id} className="snap-start">
            <AccommodationCard hotel={hotel} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccommodationSlider;
