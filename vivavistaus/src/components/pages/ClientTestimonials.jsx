import React, { useEffect, useState } from "react";

const ClientTestimonials = () => {
  const testimonials = [
    {
      text: "Building our new home was a breeze with their exceptional service.",
      author: "Alex and Taylor",
    },
    {
      text: "We couldn't have asked for a better team to bring our vision to life.",
      author: "Jordan and Casey",
    },
    {
      text: "Our experience was flawless from start to finish, and the results speak for themselves.",
      author: "Sam and Morgan",
    },
  ];

  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial(
        (prevIndex) => (prevIndex + 1) % testimonials.length
      );
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);
  return (
    <div className="bg-white">
        <section className="bg-blue-200 py-12">
          <div className="container mx-auto px-4 mt-12 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2">
              <img
                src="https://plus.unsplash.com/premium_photo-1678818408094-dac17f4d2cb8?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Living Room"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 md:pl-8">
              <h2 className="text-2xl font-semibold mb-4">
                Client Testimonials
              </h2>
              <p className="text-lg mb-4">
                “{testimonials[currentTestimonial].text}”
              </p>
              <p className="text-xl font-semibold">
                {testimonials[currentTestimonial].author}
              </p>
              <div className="flex space-x-2 mt-4">
                {testimonials.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 w-2 rounded-full ${
                      index === currentTestimonial
                        ? "bg-yellow-300"
                        : "bg-gray-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
    </div>
  );
};

export default ClientTestimonials;
