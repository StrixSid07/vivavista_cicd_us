import React, { useState, useEffect } from "react";
import { NewAddedCardComponent } from "../elements";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules"; // ✅ Correct import for Swiper v8+
import "swiper/css";
import { airplane } from "../../assets";

const NewAdded = ({ data = [], loadingData }) => {
  const getChunkSize = () => {
    if (window.innerWidth >= 1024) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  const [chunkSize, setChunkSize] = useState(getChunkSize());

  useEffect(() => {
    const handleResize = () => setChunkSize(getChunkSize());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const chunkData = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const dataChunks = chunkData(data, chunkSize);
  console.log("this is data chunk ", dataChunks);
  const [currentImageIndex, setCurrentImageIndex] = useState(
    Array(data.length).fill(0)
  );

  useEffect(() => {
    setCurrentImageIndex(Array(data.length).fill(0));
  }, [data]);

  const nextImage = (index) => {
    setCurrentImageIndex((prev) => {
      if (!data[index] || !data[index].images) return prev;
      const newIndex = [...prev];
      newIndex[index] = (newIndex[index] + 1) % data[index].images.length;
      return newIndex;
    });
  };

  const prevImage = (index) => {
    setCurrentImageIndex((prev) => {
      const newIndex = [...prev];
      newIndex[index] =
        (newIndex[index] - 1 + data[index].images.length) %
        data[index].images.length;
      return newIndex;
    });
  };

  if (loadingData || !data.length) {
    return (
      <div className="relative px-2 py-6 flex justify-center">
        <div
          className="absolute inset-0 opacity-80 z-0"
          style={{
            backgroundImage: `url(${airplane})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-white/10 hidden md:flex"></div>
        </div>
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex justify-center gap-10">
            {Array.from({ length: chunkSize }).map((_, index) => (
              <div
                key={index}
                className={`rounded-xl bg-white shadow-md p-4 h-[30rem] animate-pulse relative ${
                  chunkSize === 1
                    ? "w-full"
                    : chunkSize === 2
                    ? "w-1/2"
                    : "w-1/3"
                }`}
              >
                <div className=" h-[16rem] bg-gray-300 rounded-md"></div>
                <div className="mt-4 h-3 w-3/4 bg-gray-300 rounded-full"></div>
                <div className="mt-2 h-2 w-1/2 bg-gray-300 rounded-full"></div>
                <div className="mt-2 h-2 w-2/3 bg-gray-300 rounded-full"></div>
                <div className="mt-2 h-10 w-[20.5rem] bg-gray-300 rounded-md absolute left-4 bottom-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 py-6 flex justify-center relative">
      <div
        className="absolute inset-0 opacity-80 z-0"
        style={{
          backgroundImage: `url(${airplane})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-white/10 hidden md:flex"></div>
      </div>
      <div className="w-full max-w-6xl mx-auto">
        <Swiper
          modules={[Autoplay]} // ✅ Use `modules` prop for Swiper v8+
          loop={true}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          slidesPerView={1}
          speed={2000}
          spaceBetween={20} // Default for mobile view
          breakpoints={{
            768: {
              spaceBetween: 40,
            },
          }}
        >
          {dataChunks.map((chunk, chunkIndex) => (
            <SwiperSlide key={chunkIndex}>
              <div
                className={`flex justify-center items-center mx-auto md:gap-10 w-full ${
                  chunkSize === 1 ? "flex-col" : "flex-row"
                }`}
              >
                {chunk.map((property, index) => (
                  <div
                    key={index}
                    // Remove w-full so it doesn't stretch
                    // Add a max-w and mx-auto to center the card
                    className={`mx-auto ${
                      chunkSize === 1
                        ? "max-w-sm mb-4"
                        : chunkSize === 2
                        ? "w-1/2"
                        : "w-1/3"
                    }`}
                  >
                    <NewAddedCardComponent
                      id={property?._id ?? "N/A"}
                      images={property?.images ?? []}
                      name={property?.title ?? "Untitled"}
                      price={property?.prices?.[0]?.price ?? "N/A"}
                      location={property?.destination?.name ?? "Unknown"}
                      packageDays={property?.days ?? 0}
                      rating={
                        property?.prices?.[0]?.hotel?.tripAdvisorRating ?? 0
                      }
                      reviews={
                        property?.prices?.[0]?.hotel?.tripAdvisorReviews ?? 0
                      }
                      basis={property?.boardBasis?.name ?? "N/A"}
                      currentImage={currentImageIndex[index] ?? 0}
                      nextImage={() => nextImage(index)}
                      prevImage={() => prevImage(index)}
                      tag={property?.tag ?? ""}
                      destinations={property?.destinations ?? []}
                      deal={property} // Pass the entire deal object for slug generation
                    />
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default NewAdded;
