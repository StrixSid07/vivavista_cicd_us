import React, { useState } from "react";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";


const ImageGallery = ({ images }) => {
  const [open, setOpen] = useState(false);

  // Lightbox open handler
  const handleOpen = () => {
    setOpen(true);
  };

  // Limit the collage to 5 images, but Lightbox still shows all
  const collageImages = images.slice(0, 5);

  return (
    <div className="w-full mx-auto">
      <div
        className="
          grid
          grid-cols-2        /* 2 columns on mobile */
          md:grid-cols-4      /* 4 columns on desktop */
          md:grid-rows-2      /* 2 rows on desktop */
          gap-0               /* No gap between cells */
          auto-rows-min       /* Let content define row height on mobile */
          md:h-[300px] 
        "
      >
        {/* Large image (top-left), spanning 2 columns and 2 rows on desktop */}
        <div
          className="
            col-span-2         /* Takes 2 columns on mobile */
            md:col-span-2      /* Also 2 columns on desktop */
            md:row-span-2      /* 2 rows on desktop to be taller */
            relative
            overflow-hidden
            cursor-pointer
          "
          onClick={handleOpen}
        >
          <motion.img
            src={collageImages[0]}
            alt="Big Travel Image"
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Next 4 images (if available) */}
        {collageImages.slice(1).map((src, index) => (
          <div
            key={index}
            className="relative overflow-hidden cursor-pointer"
            onClick={handleOpen}
          >
            <motion.img
              src={src}
              alt={`Travel ${index + 2}`}
              className="w-full md:h-full h-[80px] object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Lightbox for all images (including those beyond the first 5) */}
      {open && (
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          slides={images.map((src) => ({ src }))}
          render={{
            footer: ({ currentIndex, slidesCount }) => (
              <div className="absolute bottom-0 right-0 p-4 text-white text-lg">
                {currentIndex + 1} / {slidesCount}
              </div>
            ),
          }}
        />
      )}
    </div>
  );
};

export default ImageGallery;
