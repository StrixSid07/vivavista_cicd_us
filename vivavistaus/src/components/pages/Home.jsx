import React, { useState } from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import {
  FaLocationDot,
  FaDollarSign,
  FaBuildingColumns,
} from "react-icons/fa6";
import { motion } from "framer-motion";
import { CarouselCustomNavigation } from "../elements/CarouselCustomNavigation";

const Home = ({ homeslides }) => {
  return (
    <div className="relative z-10 md:h-[680px] h-[530px] w-full flex flex-col justify-center items-start p-4 md:p-6 lg:p-8 rounded-none">
      {/* Background Carousel */}
      <div className="absolute inset-0 w-full h-auto">
        <CarouselCustomNavigation slides={homeslides} />
      </div>

      {/* Search Card */}
      {/* <div className="relative z-10 w-full max-w-full md:max-w-lg text-left ml-2 sm:ml-4 md:ml-6 lg:ml-8">
        <motion.div
          className="w-full"
          initial={{ width: "100px" }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Card className="w-full h-auto" color="white">
            <CardBody className="flex flex-col space-y-4 p-2 sm:p-3 md:p-4 lg:p-5 md:space-y-0 md:flex-row md:justify-between md:items-center md:space-x-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="flex items-center space-x-2"
              >
                <FaLocationDot
                  size="1.5rem"
                  className="text-xl text-white bg-amber-500 rounded-md p-1"
                />
                <Typography variant="h6" color="black">
                  Location
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: "easeOut" }}
                className="flex items-center space-x-2"
              >
                <FaDollarSign
                  size="1.5rem"
                  className="text-xl text-white bg-amber-500 rounded-md p-1"
                />
                <Typography variant="h6" color="black">
                  Price
                </Typography>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
                className="flex items-center space-x-2"
              >
                <FaBuildingColumns
                  size="1.5rem"
                  className="text-xl text-white bg-amber-500 rounded-md p-1"
                />
                <Typography variant="h6" color="black">
                  Type of Home
                </Typography>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>
      </div> */}
    </div>
  );
};

export default Home;
