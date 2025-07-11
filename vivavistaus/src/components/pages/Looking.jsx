import React from "react";
import { FaMoneyBillWave, FaShieldAlt, FaHeadset, FaHandshake, FaSuitcase } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import { PiCalendarStarFill } from "react-icons/pi";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { bg6 } from "../../assets";

const lookingOptions = [
  // {
  //   icon: FaMoneyBillWave,
  //   title: "Low Deposits Spread The Cost",
  // },
  {
    icon: FaShieldAlt,
    title: "100% Trusted Travel Agency",
  },
  {
    icon: PiCalendarStarFill,
    title: "15+ Years of Industry Experience",
  },
  {
    icon: MdOutlineVerified,
    title: "Lowest Price Guaranteed",
  },
  {
    icon: FaHeadset,
    title: "24x7 Support Provided",
  },
  {
    icon: FaSuitcase,
    title: "Bespoke Holiday Deals",
  },
  {
    icon: FaHandshake,
    title: "Financial Protection",
  },
];

const Looking = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: false });

  React.useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.3,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <div
      className="relative h-auto bg-gradient-to-t from-[#0078D4] to-white rounded-t-2xl -mt-3 pb-8 md:pb-16 lg:pb-20 border-t-2 border-white z-10"
      style={{
        backgroundImage: `url(${bg6})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Title */}
      <div className="absolute top-0 left-0 w-full">
        <div className="flex justify-center items-center -mt-8 md:px-0 px-4">
          <div className="px-6 py-4 flex-wrap text-center bg-[#0078D4] text-white font-bold text-xl md:text-3xl rounded-xl shadow-[0_4px_10px_rgba(255,255,255,0.5)] customfontstitle">
            Defined by Service, Driven by Experience
          </div>
        </div>
      </div>

      {/* Cards */}
      <motion.div
        ref={ref}
        className="flex flex-wrap justify-center gap-6 px-6 mt-24 md:mt-32 md:flex-nowrap md:gap-3 md:px-4 md:overflow-x-auto"
        variants={containerVariants}
        initial="hidden"
        animate={controls}
      >
        {lookingOptions.map((option, index) => (
          <motion.div
            key={index}
            className="bg-white w-64 h-64 rounded-2xl text-center group transition-all duration-500 hover:scale-105 relative overflow-hidden md:min-w-[160px] md:w-40 md:h-44 lg:min-w-[180px] lg:w-44 lg:h-48 md:flex-shrink-0 flex flex-col"
            variants={itemVariants}
          >
            {/* Animated Background Accent */}
            <div className="absolute top-0 right-0 h-40 w-40 md:h-24 md:w-24 lg:h-28 lg:w-28 bg-green-500 rounded-full transform -translate-y-1/2 translate-x-1/2 transition-all duration-[2000ms] ease-in-out group-hover:scale-[15] group-hover:rounded-none group-hover:w-full group-hover:h-full z-0"></div>

            {/* Icon */}
            <div className="relative z-10 flex items-center justify-center h-2/3 md:flex-1 md:pt-4">
              <option.icon
                size={72}
                className="text-[#0078D4] text-4xl md:text-3xl lg:text-4xl xl:text-5xl group-hover:text-white transition-all duration-300"
              />
            </div>

            {/* Title */}
            <div className="relative z-10 md:flex-1 md:flex md:items-center md:justify-center px-4 md:px-2 md:pb-4">
              <h3 className="text-[#0078D4] text-lg md:text-sm lg:text-base font-semibold group-hover:text-white transition-colors duration-300 leading-tight text-center">
                {option.title}
              </h3>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Looking;
