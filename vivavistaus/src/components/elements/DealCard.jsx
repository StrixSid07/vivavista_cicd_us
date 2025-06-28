import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaCircle } from "react-icons/fa";
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, Tag } from "lucide-react";
import { generateDealSlug } from "../../utils/slugify";


export default function DealCard({
  id,
  images,
  name,
  location,
  packageDays,
  basis,
  price,
  rating,
  reviews,
  currentImage,
  nextImage,
  prevImage,
  tag,
  deal, // Add deal object to get title for slug
}) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    const slug = deal ? generateDealSlug(deal) : id;
    navigate(`/deals/${slug}`);
  };

  return (
    <motion.div transition={{ duration: 0.3 }} className="w-[24rem] mx-auto">
      <Card className="flex flex-row md:w-full w-[340px] rounded-2xl overflow-hidden min-h-[280px] shadow-lg transition-shadow hover:shadow-xl">
        {/* Left Image Section */}
        <CardHeader
          shadow={false}
          floated={false}
          className="w-[40%] relative m-0 rounded-none"
        >
          <div className="relative h-full w-full">
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImage}
                src={images[currentImage]}
                alt="Deal"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.4 }}
                className="h-full w-full object-cover cursor-pointer"
                onClick={handleViewDetails}
              />
            </AnimatePresence>

            {/* Badge */}
            {tag && (
              <div className="absolute top-3 left-3 bg-white text-deep-orange-500 text-xs font-semibold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Tag size={14} /> {tag}
              </div>
            )}

            {/* Image Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute bottom-3 left-3 bg-black/70 hover:bg-black p-1.5 rounded-full"
            >
              <MdOutlineArrowBackIos className="text-white text-sm" />
            </button>
            <button
              onClick={nextImage}
              className="absolute bottom-3 left-12 bg-black/70 hover:bg-black p-1.5 rounded-full"
            >
              <MdOutlineArrowForwardIos className="text-white text-sm" />
            </button>
          </div>
        </CardHeader>

        {/* Right Info Section */}
        <div className="flex flex-col justify-between w-[60%]">
          <CardBody className="p-6 space-y-2 overflow-hidden">
            {/* Rating + Price */}
            <div className="flex flex-col justify-start items-start gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-amber-500">
                  {rating
                    ? Array.from({ length: 5 }, (_, i) => {
                        if (i + 1 <= Math.floor(rating)) {
                          return <FaStar key={i} className="text-sm" />;
                        } else if (i < rating) {
                          return <FaStarHalfAlt key={i} className="text-sm" />;
                        } else {
                          return (
                            <FaRegStar
                              key={i}
                              className="text-sm text-gray-300"
                            />
                          );
                        }
                      })
                    : Array.from({ length: 5 }, (_, i) => (
                        <FaRegStar key={i} className="text-sm text-gray-300" />
                      ))}
                </div>
                {rating ? (
                  <span className="text-gray-800 text-sm font-medium truncate block max-w-[200px] customfontstitle">
                    {rating.toFixed(1)} ({reviews} Reviews)
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm italic customfontstitle">
                    No reviews yet
                  </span>
                )}
              </div>

              <Typography className="text-lg font-bold text-deep-orange-600 whitespace-nowrap customfontstitle">
                ${price}
                <span className="text-sm font-normal text-gray-500 ml-1 customfontstitle">
                  /Per Person
                </span>
              </Typography>
            </div>

            {/* Title */}
            <Typography
              variant="h5"
              className="text-gray-900 font-semibold truncate customfontstitle"
              title={name}
            >
              {name}
            </Typography>

            {/* Basis */}
            <Typography
              variant="small"
              className="text-gray-600 font-medium text-sm flex items-center gap-2 truncate customfontstitle"
              title={basis}
            >
              <FaCircle size={6} /> {basis}
            </Typography>

            {/* Duration & Location */}
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-2 truncate">
                <CalendarDays size={18} />
                <span>{packageDays} Nights</span>
              </div>
              <div
                className="flex items-center gap-2 text-deep-orange-500 font-medium truncate"
                title={location}
              >
                <MapPin size={18} />
                <span>{location}</span>
              </div>
            </div>
          </CardBody>

          <CardFooter className="p-6 pt-0">
            <Button
              onClick={handleViewDetails}
              className="bg-deep-orange-500 hover:bg-deep-orange-600 text-white font-semibold text-base rounded-md py-2 w-fit normal-case customfontstitle"
            >
              Discover More
            </Button>
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
}
