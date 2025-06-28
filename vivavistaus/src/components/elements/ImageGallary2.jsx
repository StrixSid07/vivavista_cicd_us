import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { FaCamera, FaVideo, FaPlay, FaExpand } from "react-icons/fa";

const ImageGallery2 = ({ images, videos = [] }) => {
  const [openImageLightbox, setOpenImageLightbox] = useState(false);
  const [openVideoLightbox, setOpenVideoLightbox] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const videoRef = useRef(null);
  
  // Log videos for debugging
  console.log("Videos in ImageGallery2:", videos);
  
  const handleOpenImageLightbox = () => {
    setOpenImageLightbox(true);
  };
  
  const handleOpenVideoLightbox = (video) => {
    setSelectedVideo(video);
    setOpenVideoLightbox(true);
  };
  
  const handleCloseVideoLightbox = () => {
    setOpenVideoLightbox(false);
    setSelectedVideo(null);
  };

  // Determine if we should show a video in the second position
  const hasVideo = videos && videos.length > 0;
  const firstVideo = hasVideo ? videos[0] : null;
  
  // Limit the collage to 5 images, but adjust if we have a video
  let collageImages = [...images];
  if (hasVideo && collageImages.length >= 4) {
    // If we have a video and at least 4 images, remove one image to make space for the video
    collageImages = [collageImages[0], ...collageImages.slice(2, 5)];
  } else if (hasVideo) {
    // If we have fewer than 4 images, just use what we have
    collageImages = collageImages.length > 0 ? [collageImages[0], ...collageImages.slice(1)] : [];
  } else {
    // No video, use up to 5 images
    collageImages = collageImages.slice(0, 5);
  }

  return (
    <div className="w-full mx-auto pt-4 md:px-20 px-2 relative">
      <div
        className="
          grid
          grid-cols-2
          md:grid-cols-4
          md:grid-rows-2
          gap-2
          rounded-xl
          overflow-hidden
        "
      >
        {/* Large image */}
        <div
          className="
            col-span-2
            md:col-span-2
            md:row-span-2
            relative
            cursor-pointer
            rounded-xl
            overflow-hidden
          "
          onClick={handleOpenImageLightbox}
        >
          <motion.img
            src={collageImages[0]}
            alt="Main Travel"
            className="w-full h-[450px] object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Video in second position (if available) */}
        {hasVideo && (
          <div
            className="cursor-pointer rounded-xl overflow-hidden relative"
            onClick={() => handleOpenVideoLightbox(firstVideo)}
          >
            <video
              ref={videoRef}
              src={firstVideo.url}
              className="w-full object-cover md:h-[220px] h-[120px]"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        )}

        {/* Remaining images */}
        {hasVideo 
          ? collageImages.slice(1).map((src, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-xl overflow-hidden"
                onClick={handleOpenImageLightbox}
              >
                <motion.img
                  src={src}
                  alt={`Travel ${index + 2}`}
                  className="w-full object-cover md:h-[220px] h-[120px]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))
          : collageImages.slice(1).map((src, index) => (
              <div
                key={index}
                className="cursor-pointer rounded-xl overflow-hidden"
                onClick={handleOpenImageLightbox}
              >
                <motion.img
                  src={src}
                  alt={`Travel ${index + 2}`}
                  className="w-full object-cover md:h-[220px] h-[120px]"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            ))
        }

        {/* Overlay icons */}
        <div
          className="
            absolute md:bottom-4 bottom-2 md:right-24 right-2 z-10 flex items-center gap-3
            bg-black/40 p-2 rounded-full backdrop-blur-sm
          "
        >
          <button
            onClick={handleOpenImageLightbox}
            className="text-white text-lg transition duration-500 ease-in-out hover:text-blue-500"
            title="View Images"
          >
            <FaCamera />
          </button>
          {hasVideo && (
            <button 
              onClick={() => handleOpenVideoLightbox(firstVideo)}
              className="text-white text-lg transition duration-500 ease-in-out hover:text-blue-500"
              title="View Videos"
            >
              <FaVideo />
            </button>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {openImageLightbox && (
        <Lightbox
          open={openImageLightbox}
          close={() => setOpenImageLightbox(false)}
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

      {/* Video Lightbox */}
      {openVideoLightbox && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full max-w-4xl">
            <button 
              onClick={handleCloseVideoLightbox}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            
            <video
              src={selectedVideo.url}
              className="w-full"
              controls
              autoPlay
              playsInline
            />
            
            {videos.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                {videos.map((video, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVideo(video)}
                    className={`flex-shrink-0 ${selectedVideo.url === video.url ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <video
                      src={video.url}
                      className="w-24 h-16 object-cover"
                      muted
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery2;
