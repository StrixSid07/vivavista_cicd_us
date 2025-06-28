import { Carousel } from "@material-tailwind/react";
import { motion } from "framer-motion";
import { Button } from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { generateDealSlug } from "../../utils/slugify";
import bg1 from "../../assets/bg/homebg1.jpg";
import bg2 from "../../assets/bg/homebg2.jpg";
import bg3 from "../../assets/bg/homebg3.jpg";


const buttonVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};


export function CarouselCustomNavigation({slides}) {
  const navigate = useNavigate();

  const handleSlideClick = (slide) => {
    // If the slide has a deal, navigate to that deal's detail page
    if (slide.deal && slide.deal._id && slide.deal.title) {
      navigate(`/deals/${generateDealSlug(slide.deal)}`);
    }
  };

  return (
    <Carousel
      className="h-full w-full relative"
      transition={{ duration: 1 }}
      loop={true}
      autoplay={true}
      navigation={({ setActiveIndex, activeIndex, length }) => (
        <div className="absolute bottom-4 left-2/4 z-50 flex -translate-x-2/4 gap-2">
          {new Array(length).fill("").map((_, i) => (
            <span
              key={i}
              className={`block h-1 cursor-pointer rounded-2xl transition-all content-[''] ${
                activeIndex === i ? "w-8 bg-white" : "w-4 bg-white/50"
              }`}
              onClick={() => setActiveIndex(i)}
            />
          ))}
        </div>
      )}
    >
      {slides.map((slide, index) => (
        <div 
          key={index} 
          className={`relative h-full w-full ${slide.deal ? 'cursor-pointer' : ''}`}
          onClick={() => handleSlideClick(slide)}
        >
          <img
            src={slide.image}
            alt={`Slide ${index + 1}`}
            className="h-full w-full object-cover"
          />
          
          {/* Show "Discover Deal" button if slide has a deal */}
          {slide.deal && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-500">
              <div className="absolute inset-0 bg-black bg-opacity-10 hover:bg-opacity-20 transition-all duration-300"></div>
              <motion.div
                className="relative z-10"
                initial="hidden"
                animate="visible"
                variants={buttonVariants}
              >
                <Button className="bg-white bg-opacity-80 text-orange-600 font-medium md:font-semibold md:px-6 md:py-3 px-4 py-2 rounded-md text-md md:text-lg transition-all duration-300 hover:bg-opacity-90 hover:bg-orange-600 hover:text-white hover:scale-105 shadow-md backdrop-blur-sm">
                  Discover Deal
                </Button>
              </motion.div>
            </div>
          )}
          
          {/* <div className="absolute inset-0 flex flex-col items-start justify-center">
            <h2 className="text-white text-lg md:text-4xl md:ml-32 ml-16 md:max-w-5xl max-w-xl font-bold text-left">
              {slide.text}
            </h2>
            <div className="bg-white md:rounded-full rounded-md w-auto px-4 py-2 md:text-md text-sm font-medium md:font-semibold md:ml-32 ml-16 text-orange-600 mt-8">
              {slide.destination}
            </div>
            <motion.div
              className="relative mt-8 md:ml-32 ml-16"
              initial="hidden"
              animate="visible"
              variants={buttonVariants}
            >
              <Button className="bg-white text-orange-600 font-medium md:font-semibold md:px-6 md:py-3 px-4 py-2 rounded-md text-md md:text-lg transition-all duration-300 hover:bg-orange-600 hover:text-white hover:scale-105 shadow-md">
                Book Now
              </Button>
            </motion.div>
          </div> */}
        </div>
      ))}
    </Carousel>
  );
}
