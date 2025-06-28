import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import {
  Card,
  Input,
  Textarea,
  Button,
  Typography,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Alert,
} from "@material-tailwind/react";
import { Uk } from "../../assets";
import {
  FaFacebookF,
  FaInstagram,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Map } from "../elements";
import { FaLocationDot } from "react-icons/fa6";
import { useCountries } from "use-react-countries";
import { Base_Url } from "../../utils/Api";

const ContactUs = () => {
  const { countries } = useCountries();
  const [country, setCountry] = useState(0);

  useEffect(() => {
    if (countries.length) {
      const defaultIndex = countries.findIndex(
        (c) => c.name === "Canada"
      );
      if (defaultIndex !== -1) {
        setCountry(defaultIndex);
      }
    }
  }, [countries]);

  const { name, flags, countryCallingCode } = countries[country] || {
    name: "Canada",
    flags: { svg: "https://flagcdn.com/ca.svg" },
    countryCallingCode: "+1",
  };

  const [alert, setAlert] = React.useState({
    open: false,
    color: "green",
    message: "",
  });

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      email: formData.email,
      phone: `${countryCallingCode} ${formData.phone}`,
      message: formData.message,
    };
    try {
      const res = await axios.post(`${Base_Url}/mail/contactus`, payload);
      setAlert({
        open: true,
        color: "green",
        message:
          "Thank you for connecting with Viva Vista Vacations! We will get back to you shortly.",
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => {
        setAlert({ open: false, color: "", message: "" });
      }, 4000);
    } catch (error) {
      setAlert({
        open: true,
        color: "red",
        message:
          "Oops! Something went wrong. Please check your details or try again later.",
      });
      setTimeout(() => {
        setAlert({ open: false, color: "", message: "" });
      }, 4000);
      console.error("Error sending message:", error);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center overflow-hidden mt-4 md:mt-12 lg:mt-16 mb-8">
      <img
        src={Uk}
        alt="Background"
        className="fixed inset-0 w-full h-screen object-cover z-[-1]"
      />
      <div className="fixed inset-0 z-[-1]"></div>

      <div className="relative container mx-auto px-4 md:px-8 lg:px-16 py-8 md:py-16 space-y-8">
        {alert.open && (
          <Alert
            animate={{
              mount: { y: 0 },
              unmount: { y: 100 },
            }}
            color={alert.color}
            variant="gradient"
            className="relative mb-4 pr-10"
          >
            {alert.message}
            <button
              onClick={() => setAlert({ ...alert, open: false })}
              className="absolute top-4 right-4 text-sm text-white hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </Alert>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-8 md:space-y-0 md:space-x-8">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:w-5/12 lg:w-1/3 flex justify-center mt-12 md:mt-0 lg:mt-0"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white flex flex-col justify-center rounded-lg shadow-lg p-6 md:p-8"
            >
              {/* Address Section */}
              <div className="mb-6">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-deep-orange-500">
                  Address
                </h1>
                <p className="text-base flex justify-center text-left items-center gap-4 md:text-lg lg:text-xl">
                  <FaLocationDot className="text-red-500" size={24} /> 01, 195-197 Wood Street, London, England, E17 3NU
                </p>
              </div>
              {/* Contact Info */}
              <div className="mb-6">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
                  Call Us On
                </h1>
                <p className="text-base flex items-center justify-start gap-4 md:text-lg lg:text-xl transition duration-700 ease-in-out hover:text-deep-orange-500">
                  <FaPhoneAlt className="text-green-500" size={24} />{" "}
                  <a href="tel:+18000000000">1 8** *** ****</a>
                </p>
              </div>
              <div className="mb-6">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">
                  Email Us On
                </h1>
                <p className="text-base flex items-center justify-start gap-4 md:text-lg lg:text-xl transition duration-700 ease-in-out hover:text-deep-orange-500">
                  <FaEnvelope className="text-blue-600" size={24} />
                  <a href="mailto:admin@vivavistavacations.ca">
                    admin@vivavistavacations.ca
                  </a>
                </p>
              </div>
              {/* Social Media Icons */}
              <div className="flex justify-start mt-4 space-x-4">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col justify-center items-center space-y-2 group"
                >
                  <a
                    href="https://www.facebook.com/share/1DQGeYZjJJ/?mibextid=wwXIfr"
                    target="_new"
                    className="transition-all ease-out duration-500 group-hover:text-blue-900"
                  >
                    <FaFacebookF size={24} />
                  </a>
                  <label className="transition-all ease-out duration-500 group-hover:text-blue-900 group-hover:underline underline-offset-4">
                    Facebook
                  </label>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col justify-center items-center space-y-2 group"
                >
                  <a
                    href="https://www.instagram.com/vivavistavacations?igsh=MTVqdHBjaGZlZGVhOA=="
                    target="_new"
                    className="group-hover:text-pink-500"
                  >
                    <FaInstagram size={24} />
                  </a>
                  <label className="transition-all ease-out duration-500 group-hover:text-pink-500 group-hover:underline underline-offset-4">
                    Instagram
                  </label>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="md:w-5/12 lg:w-1/2 flex justify-center"
          >
            <Card color="white" className="w-full p-8 shadow-xl" shadow={false}>
              <Typography
                variant="h4"
                color="deep-orange"
                className="text-center customfontstitle"
              >
                Get in Touch
              </Typography>
              <Typography
                color="gray"
                className="mt-1 text-center font-normal customfontstitle"
              >
                We'd love to hear from you! Fill out the form below to get in
                touch.
              </Typography>
              <form className="mt-8 w-full" onSubmit={handleSubmit}>
                <div className="mb-4 flex flex-col gap-4">
                  <Input
                    size="lg"
                    placeholder="Your Name"
                    label="Name"
                    color="blue"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                  <Input
                    size="lg"
                    placeholder="Your Email"
                    label="Email"
                    name="email"
                    color="blue"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {/* Phone Input With Country Code */}
                  <div className="relative flex w-full">
                    <Menu placement="bottom-start">
                      <MenuHandler>
                        <Button
                          ripple={false}
                          variant="text"
                          color="blue-gray"
                          className="flex h-10 items-center gap-2 rounded-r-none border border-r-0 border-blue-gray-200 bg-blue-gray-500/10 pl-3"
                        >
                          <img
                            src={flags.svg}
                            alt={name}
                            className="h-4 w-5 object-cover"
                          />
                          {countryCallingCode}
                        </Button>
                      </MenuHandler>
                      <MenuList className="max-h-[20rem] max-w-[18rem]">
                        {countries.map(
                          ({ name, flags, countryCallingCode }, index) => (
                            <MenuItem
                              key={name}
                              className="flex items-center gap-2"
                              onClick={() => setCountry(index)}
                            >
                              <img
                                src={flags.svg}
                                alt={name}
                                className="h-4 w-5 object-cover"
                              />
                              {name}
                              <span className="ml-auto">
                                {countryCallingCode}
                              </span>
                            </MenuItem>
                          )
                        )}
                      </MenuList>
                    </Menu>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="border"
                      color="blue"
                      placeholder="Mobile Number"
                      className="rounded-l-none !border-t-blue-gray-200 focus:!border-t-blue-500"
                      labelProps={{
                        className: "before:content-none after:content-none",
                      }}
                      containerProps={{ className: "min-w-0" }}
                    />
                  </div>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    size="lg"
                    label="Message"
                    color="blue"
                  />
                </div>
                <Button
                  type="submit"
                  className="mt-6 text-white customfontstitle"
                  color="deep-orange"
                  fullWidth
                >
                  Send Message
                </Button>
                <Typography
                  color="gray"
                  className="mt-4 text-center font-normal customfontstitle"
                >
                  We respect your privacy. Your information will remain
                  confidential.
                </Typography>
              </form>
            </Card>
          </motion.div>
        </div>
        {/* Map Component */}
        <div className="mt-16 w-full h-[500px]">
          <Map
            latitude={51.58583056152749}
            longitude={-0.0015499736703773832}
            title="Viva Vista Vacation Fe"
          />
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
