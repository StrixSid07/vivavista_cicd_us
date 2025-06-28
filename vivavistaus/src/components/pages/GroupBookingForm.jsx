import {
  Input,
  Alert,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Select,
  Option,
  Textarea,
  Button,
  Card,
  CardBody,
} from "@material-tailwind/react";
import { useCountries } from "use-react-countries";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { groupbooking } from "../../assets";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Base_Url } from "../../utils/Api";
import axios from "axios";

const Title = ["Mr.", "Mrs.", "Miss."];

export default function GroupBookingForm() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [username, setName] = useState("");
  const [email, setEmail] = useState("");
  const [adults, setAdults] = useState("");
  const [children, setChildren] = useState("");
  const [callTimeFrom, setCallTimeFrom] = useState("");
  const [callTimeTo, setCallTimeTo] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = React.useState(0);
  const { countries } = useCountries();
  const [country, setCountry] = React.useState(0);

  // Set UK as default once countries are loaded
  React.useEffect(() => {
    if (countries.length) {
      const defaultIndex = countries.findIndex(
        (c) => c.name === "Canada"
      );
      if (defaultIndex !== -1) {
        setCountry(defaultIndex);
      }
    }
  }, [countries]);
  const { name, flags, countryCallingCode } = countries[country];
  const adultOptions = [...Array(10).keys()].map((i) => (i + 1).toString());
  adultOptions.push("10+");

  const childrenOptions = [...Array(9).keys()].map((i) => (i + 2).toString()); // 2 to 10
  childrenOptions.push("10+");

  const [alert, setAlert] = React.useState({
    open: false,
    color: "green",
    message: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      const payload = {
        title: Title[title],
        name: username,
        email,
        phone,
        country: countries[country].name,
        countryCallingCode,
        adults,
        children: children === "" ? "0" : children,
        callTimeFrom,
        callTimeTo,
        additionalNotes,
      };

      const res = await axios.post(
        `${Base_Url}/mail/groupbookinginquiry/`,
        payload
      );

      if (res.status === 200) {
        // Success alert
        setAlert({
          open: true,
          color: "green",
          message: "Inquiry sent successfully!",
        });
        setName("");
        setEmail("");
        setPhone("");
        setAdults("");
        setChildren("");
        setCallTimeFrom("");
        setCallTimeTo("");
        setAdditionalNotes("");
        setTitle(0);
      } else {
        // Error alert
        setAlert({
          open: true,
          color: "red",
          message: "Failed to send inquiry. Please try again.",
        });
        console.error(res.data);
      }
    } catch (err) {
      console.error("Submit Error:", err);
      const message =
        err.response?.data?.message ||
        "Something went wrong. Please try again.";
      // General error alert
      setAlert({
        open: true,
        color: "red",
        message,
      });
    } finally {
      setLoading(false); // Stop loading

      // Auto-close the alert after 4 seconds
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, open: false }));
      }, 4000);
    }
  };

  return (
    <div className="relative flex flex-col md:flex-row items-center justify-center md:h-screen h-auto px-6 md:pt-0 py-10 md:py-0 md:mb-0 -mb-12 bg-white">
      {/* Full page background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={groupbooking}
          alt="Group Booking"
          className="w-full md:h-screen h-full object-cover"
        />
        {/* Dark overlay to make the content more readable */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* Form Section */}
      <Card className="w-full max-w-4xl mx-auto md:p-6 md:-mt-20 rounded-2xl shadow-lg bg-white relative z-10">
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
        <button
          onClick={() => navigate("/")}
          className="absolute top-2 right-2 bg-red-100 rounded-md hover:text-red-500"
          aria-label="Close"
        >
          <MdClose size={24} />
        </button>
        <CardBody>
          <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">
            Group Booking Enquiries
          </h2>

          <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
            {/* Row 1: Title, Name, Email */}
            <div className="grid grid-cols-1">
              <div className="relative flex w-full">
                <Menu placement="bottom-start">
                  <MenuHandler>
                    <Button
                      ripple={false}
                      variant="text"
                      color="blue-gray"
                      className="h-10 w-14 shrink-0 rounded-r-none border border-r-0 border-blue-gray-200 bg-transparent px-3"
                    >
                      {Title[title]}
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-[20rem] max-w-[18rem]">
                    {Title.map((title, index) => (
                      <MenuItem key={title} onClick={() => setTitle(index)}>
                        {title}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
                <Input
                  type="text"
                  placeholder="Enter your name"
                  value={username}
                  onChange={(e) => setName(e.target.value)}
                  className="rounded-l-none !border-t-blue-gray-200 placeholder:text-blue-gray-300 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  containerProps={{ className: "min-w-0" }}
                />
              </div>
            </div>

            {/* Row 2: Phone, Adults, Children */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          {name}{" "}
                          <span className="ml-auto">{countryCallingCode}</span>
                        </MenuItem>
                      )
                    )}
                  </MenuList>
                </Menu>
                <Input
                  type="tel"
                  placeholder="Mobile Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="rounded-l-none !border-t-blue-gray-200 focus:!border-t-gray-900"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  containerProps={{ className: "min-w-0" }}
                />
              </div>
              <Input
                label="Enter your email"
                icon={<FaEnvelope />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                size="md"
                animate={{
                  mount: { y: 0 },
                  unmount: { y: 25 },
                }}
                label="Adults"
                value={adults}
                onChange={(val) => setAdults(val)}
              >
                {adultOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
              <Select
                size="md"
                animate={{
                  mount: { y: 0 },
                  unmount: { y: 25 },
                }}
                label="Children (Age 2–11)"
                value={children}
                onChange={(val) => setChildren(val)}
              >
                {childrenOptions.map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Row 3: Call Time */}
            <div className="w-full flex flex-col gap-4">
              <label className="text-sm text-gray-700 font-medium">
                When would be a convenient time to call you?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col w-full">
                  <Input
                    label="From"
                    type="time"
                    variant="border"
                    className="w-full"
                    value={callTimeFrom}
                    onChange={(e) => setCallTimeFrom(e.target.value)}
                  />
                </div>
                <div className="flex flex-col w-full">
                  <Input
                    label="To"
                    type="time"
                    variant="border"
                    className="w-full"
                    value={callTimeTo}
                    onChange={(e) => setCallTimeTo(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Additional Notes */}
            <Textarea
              label="Additional Requirements"
              rows={4}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
            />

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className={`bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-full shadow-md hover:brightness-110 transition ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                fullWidth
              >
                {loading ? "Sending..." : "SUBMIT"}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
