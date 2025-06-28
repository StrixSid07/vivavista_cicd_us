import React from "react";
import { motion } from "framer-motion";
import { NewCardComponent, NewPropertySearchComponent } from "../elements";
import { useState, useEffect, useCallback } from "react";
import {
  IconButton,
  Typography,
  Button,
  Drawer,
} from "@material-tailwind/react";
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const itemsPerPage = 6;

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const properties = [
  {
    images: [
      "https://plus.unsplash.com/premium_photo-1676321688612-4451a8721435?q=80&w=2007&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?q=80&w=1780&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Beautiful Family Home",
    price: 450000,
    address: "123 Maple Street, Springfield, IL",
    area: 2400,
    bedrooms: 4,
    bathrooms: 3,
    daysAgo: 5,
    tag: "For Rent",
  },
  {
    images: [
      "https://plus.unsplash.com/premium_photo-1670359036016-3fc5bde40db6?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1416331108676-a22ccb276e35?q=80&w=2067&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://plus.unsplash.com/premium_photo-1680300960905-56644a13137e?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Modern Apartment",
    price: 300000,
    address: "456 Oak Avenue, Springfield, IL",
    area: 1200,
    bedrooms: 2,
    bathrooms: 2,
    daysAgo: 3,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1517433672004-e7d3f6f2d6a7?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1555685812-dcd5e7f02479?q=80&w=2038&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1601492685681-124c3a87d452?q=80&w=2025&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Cozy Cottage",
    price: 220000,
    address: "789 Pine Lane, Springfield, IL",
    area: 1800,
    bedrooms: 3,
    bathrooms: 2,
    daysAgo: 10,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1591632091761-b92f59781712?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1555685793-9058dbe0f047?q=80&w=2048&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1543163798-87c2b1f4ae3b?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Luxurious Penthouse",
    price: 850000,
    address: "101 River Road, Springfield, IL",
    area: 3000,
    bedrooms: 5,
    bathrooms: 4,
    daysAgo: 7,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1565888047-7a1eac5276d7?q=80&w=2010&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1545305627-0bda8a3cdd5b?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1598666373912-5b0a81c0718a?q=80&w=2020&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Elegant Townhouse",
    price: 370000,
    address: "202 Birch Street, Springfield, IL",
    area: 1600,
    bedrooms: 3,
    bathrooms: 2,
    daysAgo: 8,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1565736456-3d58a5b8e46e?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1518001807020-b3dd00b5407d?q=80&w=2040&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1570282787076-d601e2d3ebd5?q=80&w=2010&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Spacious Loft",
    price: 420000,
    address: "303 Cedar Lane, Springfield, IL",
    area: 2500,
    bedrooms: 4,
    bathrooms: 3,
    daysAgo: 2,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1552417873-5e7d7d62d3b7?q=80&w=1900&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1566403443-6d94d39c650c?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1547653448-60f58d0ffed0?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Charming Bungalow",
    price: 290000,
    address: "404 Elm Street, Springfield, IL",
    area: 1500,
    bedrooms: 3,
    bathrooms: 1,
    daysAgo: 4,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1565743177-3b75be0e19d5?q=80&w=2020&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1517439125-19e36bb19c2e?q=80&w=2010&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1572325237-df0c4c7d54b3?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Contemporary Residence",
    price: 380000,
    address: "505 Oakwood Drive, Springfield, IL",
    area: 2100,
    bedrooms: 4,
    bathrooms: 2,
    daysAgo: 6,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1580925019363-f2b2a6c7011b?q=80&w=1980&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1583255183236-56b9f79a4c1d?q=80&w=1970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1580453890974-5117b8a1849a?q=80&w=1950&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Rustic Farmhouse",
    price: 250000,
    address: "606 Meadow Lane, Springfield, IL",
    area: 2000,
    bedrooms: 4,
    bathrooms: 3,
    daysAgo: 9,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1560852534-24f4c9a4c62c?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1570965713934-d94ae7d6b24d?q=80&w=1940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1553716716-c8fdfbb6d12b?q=80&w=1910&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Modern Farmhouse",
    price: 310000,
    address: "707 Harvest Lane, Springfield, IL",
    area: 2200,
    bedrooms: 3,
    bathrooms: 2,
    daysAgo: 1,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1566945013-5f8ec43c93b1?q=80&w=1920&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1565128050-3aaf8c055a9b?q=80&w=1930&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1566077036-4d2d9ed14d29?q=80&w=1940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Elegant Apartment",
    price: 280000,
    address: "808 Brookside Drive, Springfield, IL",
    area: 1300,
    bedrooms: 2,
    bathrooms: 2,
    daysAgo: 5,
    tag: "For Rent",
  },
  {
    images: [
      "https://images.unsplash.com/photo-1560511250-07e9189f2af9?q=80&w=2020&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1554941665-d81e039a0d42?q=80&w=2040&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1554941483-f5400a0c5b09?q=80&w=2030&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    ],
    name: "Art Deco Home",
    price: 350000,
    address: "909 Maplewood Avenue, Springfield, IL",
    area: 1900,
    bedrooms: 3,
    bathrooms: 2,
    daysAgo: 4,
    tag: "For Rent",
  },
];

const NewProperty = () => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [visibleProperties, setVisibleProperties] = React.useState(
    properties.slice(0, itemsPerPage)
  );
  const [currentImageIndexes, setCurrentImageIndexes] = React.useState(
    properties.slice(0, itemsPerPage).map(() => 0)
  );
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleNextImage = (index) => {
    setCurrentImageIndexes((prevIndexes) =>
      prevIndexes.map((currentIndex, idx) =>
        idx === index
          ? (currentIndex + 1) % properties[idx].images.length
          : currentIndex
      )
    );
  };

  const handlePrevImage = (index) => {
    setCurrentImageIndexes((prevIndexes) =>
      prevIndexes.map((currentIndex, idx) =>
        idx === index
          ? (currentIndex - 1 + properties[idx].images.length) %
            properties[idx].images.length
          : currentIndex
      )
    );
  };

  const [isLoading, setIsLoading] = useState(false); // Ensure this is defined before use

  const handlePageChange = (page) => {
    setCurrentPage(page);
    const startIndex = (page - 1) * itemsPerPage;
    const newVisibleProperties = properties.slice(startIndex, startIndex + itemsPerPage);
    setVisibleProperties(newVisibleProperties);
    setCurrentImageIndexes(newVisibleProperties.map(() => 0));

    // Ensure scroll to top after setting the page
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 0);
  };

  const debouncedHandleScroll = debounce(() => {
    if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight) {
      if (currentPage * itemsPerPage < properties.length && !isLoading) {
        setIsLoading(true); // Set loading flag to prevent multiple page changes
        handlePageChange(currentPage + 1);
      }
    }
  }, 200); // Adjust debounce delay as needed

  useEffect(() => {
    const handleScrollEvent = () => {
      debouncedHandleScroll();
    };

    window.addEventListener('scroll', handleScrollEvent);
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, [currentPage, isLoading, debouncedHandleScroll]);

  useEffect(() => {
    if (isLoading) {
      // Simulate loading complete
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000); // Adjust as needed for your loading simulation
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  const totalPages = Math.ceil(properties.length / itemsPerPage);

  return (
    <motion.div
      className="flex flex-col lg:flex-row gap-6 p-8 md::p-12 lg:p-16 mt-12 md:mt-16 lg:mt-16 bg-gradient-to-t from-gray-900 to-gray-300"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Left side: Card Grid */}
      <motion.div
        className="w-full lg:w-2/3 lg:pr-4"
        initial={{ opacity: 0, x: -90 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleProperties.map((property, index) => (
            <NewCardComponent
              key={index}
              images={property.images}
              name={property.name}
              price={property.price}
              address={property.address}
              area={property.area}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              daysAgo={property.daysAgo}
              currentImage={currentImageIndexes[index]}
              nextImage={() => handleNextImage(index)}
              prevImage={() => handlePrevImage(index)}
              tag={property.tag}
            />
          ))}
        </div>
        {/* Pagination */}
        <div className="flex items-center gap-8 mt-6">
          <IconButton
            size="sm"
            variant="outlined"
            color="white"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ArrowLeftIcon strokeWidth={2} className="h-4 w-4 text-white" />
          </IconButton>
          <Typography color="white" className="font-normal">
            Page <strong className="text-white">{currentPage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </Typography>
          <IconButton
            size="sm"
            variant="outlined"
            color="white"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ArrowRightIcon strokeWidth={2} className="h-4 w-4 text-white" />
          </IconButton>
        </div>
      </motion.div>

      {/* Right side: Sticky Search Component for larger screens */}
      <motion.div
        className="w-full lg:w-1/3 lg:sticky lg:top-4 hidden lg:block"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
      >
        <NewPropertySearchComponent />
      </motion.div>

      {/* Search Button for mobile and tablet vertical view */}
      {!isSidebarOpen && (
        <div className="lg:hidden fixed bottom-8 right-8">
          <Button
            size="lg"
            variant="gradient"
            color="gray"
            className="flex items-center gap-2"
            onClick={() => setIsSidebarOpen(true)}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Search
          </Button>
        </div>
      )}

      {/* Sidebar Drawer */}
      <Drawer
        open={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        className="p-4 overflow-y-auto"
        placement="left"
      >
        <NewPropertySearchComponent />
      </Drawer>
    </motion.div>
  );
};


export default NewProperty;
