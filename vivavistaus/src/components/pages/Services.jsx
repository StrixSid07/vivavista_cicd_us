import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { motion } from "framer-motion";
import {
  FaTools,
  FaBuilding,
  FaDraftingCompass,
  FaCheckCircle,
  FaPager,
  FaLeaf,
  FaHammer,
  FaRoad,
} from "react-icons/fa";

const services = [
  {
    title: "Comprehensive Project Management",
    description:
      "We oversee every aspect of the construction process, from initial planning and design through to final handover. Our project management services ensure that your project is completed on time, within budget, and to the highest quality standards.",
    icon: <FaTools className="text-blue-500 text-3xl" />,
  },
  {
    title: "Construction and Engineering",
    description:
      "Our team of experienced engineers and builders work together to deliver top-tier construction services for residential, commercial, and industrial projects. We specialize in everything from ground-up builds to complex renovations and expansions.",
    icon: <FaBuilding className="text-green-500 text-3xl" />,
  },
  {
    title: "Design and Planning",
    description:
      "We provide expert design and planning services that turn your vision into a workable plan. Our architects and planners collaborate with you to create designs that are not only aesthetically pleasing but also practical, sustainable, and compliant with all regulations.",
    icon: <FaDraftingCompass className="text-yellow-500 text-3xl" />,
  },
  {
    title: "Construction Approvals and Compliance",
    description:
      "Navigating the complexities of construction approvals can be challenging. We streamline the process for you, ensuring that all necessary permits, licenses, and approvals are obtained efficiently, keeping your project on track and in line with local regulations.",
    icon: <FaCheckCircle className="text-purple-500 text-3xl" />,
  },
  {
    title: "Consulting Services",
    description:
      "We offer specialized consulting services across various aspects of construction, including site assessments, feasibility studies, and cost estimation. Our consulting team provides you with the insights and strategies needed to make informed decisions at every stage of your project.",
    icon: <FaPager className="text-red-500 text-3xl" />,
  },
  {
    title: "Sustainable Building Solutions",
    description:
      "We are committed to sustainable construction practices. Our team integrates eco-friendly materials and energy-efficient technologies into our projects, helping you achieve sustainability goals while reducing environmental impact.",
    icon: <FaLeaf className="text-teal-500 text-3xl" />,
  },
  {
    title: "Renovations and Fit-Outs",
    description:
      "Whether you’re looking to modernize an existing space or customize a new one, we provide comprehensive renovation and fit-out services. We tailor our solutions to meet your specific needs, ensuring that your space is functional, stylish, and ready for use.",
    icon: <FaHammer className="text-orange-500 text-3xl" />,
  },
  {
    title: "Civil and Infrastructure Works",
    description:
      "We also undertake civil engineering projects, including roadworks, utilities, and other infrastructure developments. Our team is equipped to handle large-scale projects that require specialized expertise and meticulous attention to detail.",
    icon: <FaRoad className="text-gray-500 text-3xl" />,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Services = () => {
  return (
    <div className="bg-gradient-to-t from-blue-400 to-gray-100">
      <div className="container mx-auto py-10 px-5 mt-4 md:mt-12 lg:mt-16">
        <Typography
          variant="h2"
          className="text-center mb-8 text-3xl font-bold"
        >
          Our Services
        </Typography>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex"
            >
              <Card className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-500 p-6 flex flex-col items-center text-center w-full">
                <div className="mb-4">{service.icon}</div>
                <CardBody>
                  <Typography
                    variant="h5"
                    className="mb-3 text-xl font-semibold"
                  >
                    {service.title}
                  </Typography>
                  <Typography className="text-gray-700">
                    {service.description}
                  </Typography>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
