import {
  Card,
  Input,
  Button,
  Typography,
  Textarea,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Checkbox,
  CardFooter,
  Alert,
  IconButton,
} from "@material-tailwind/react";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
  FaSuitcaseRolling,
  FaCalendarAlt,
  FaUserFriends,
} from "react-icons/fa";
import { useContext } from "react";
import { X } from "lucide-react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import React from "react";
import { useCountries } from "use-react-countries";
import axios from "axios";
import { Base_Url } from "../../utils/Api";
import { LeadContext } from "../../contexts/LeadContext";
const ConciergeFormCard = ({
  handleClose,
  dealId,
  dealtitle,
  adultCount,

  selectedDate,
  airport,
}) => {
  const { countries } = useCountries();
  const [country, setCountry] = React.useState(0);
  const [subscribe, setSubscribe] = React.useState(false);
  const { totalPrice, dealtitleform } = useContext(LeadContext);
  console.log("this is airport", dealId);
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

  React.useEffect(() => {
    if (countries.length) {
      setFormData((prev) => ({
        ...prev,
        countryCallingCode: countries[country]?.countryCallingCode || "",
      }));
    }
  }, [country, countries]);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    countryCallingCode: "",
  });

  const [alert, setAlert] = React.useState({
    open: false,
    message: "",
    type: "", // 'success' or 'error'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      dealId,
      name: formData.name,
      email: formData.email,
      phone: `${formData.countryCallingCode}${formData.phone}`,
      message: formData.message,
      selectedDate,
      airport,
      adults: adultCount,
    };

    try {
      const { data } = await axios.post(`${Base_Url}/bookings`, bookingData);

      if (subscribe) {
        try {
          await axios.post(`${Base_Url}/home/subscribe-newsletter`, {
            email: formData.email,
          });
        } catch (err) {
          console.error("Newsletter subscription failed:", err);
        }
      }

      await axios.post(`${Base_Url}/mail/notify-admin-booking`, {
        name: formData.name,
        email: formData.email,
        phone: `${formData.countryCallingCode}${formData.phone}`,
        message: formData.message,
        dealId,
        dealTitle: dealtitleform,
        pax: adultCount,
        airport,
        selectedDate,
        totalPrice,
      });

      setAlert({
        open: true,
        message: "Booking created successfully!",
        type: "success",
      });
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, open: false }));
        handleClose();
      }, 5000);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        countryCallingCode: countries[country]?.countryCallingCode || "", // reset to selected country code
      });
      setSubscribe(false);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || "Error submitting booking.";
      setAlert({
        open: true,
        message: errMsg,
        type: "error",
      });
      setTimeout(() => {
        setAlert((prev) => ({ ...prev, open: false }));
      }, 5000);
      console.error(error);
    }
  };

  return (
    <Card className="w-full md:max-w-lg md:p-4 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <Typography variant="h5" className="font-semibold customfontstitle">
            Connect With Our Concierge
          </Typography>
          <Typography
            variant="small"
            className="text-gray-600 mt-1 customfontstitle"
          >
            Found Your Ideal Date and Price? Let's Personalize Your Booking
            Together!
          </Typography>
        </div>
        <button onClick={handleClose}>
          <X className="w-6 h-6 text-black hover:text-red-500 rounded-md bg-red-50 hover:bg-red-100" />
        </button>
      </div>

      {/* Phone + WhatsApp */}
      <div className="flex flex-col md:flex-row gap-3">
        <a
          href="tel:+18000000000"
          className="flex-1 bg-white border border-blue-500 text-blue-600 font-semibold rounded-lg px-2 py-2 text-center hover:bg-blue-50 transition customfontstitle"
        >
          <span className="flex justify-center items-center gap-2">
            <FaPhoneAlt /> 1 8** *** ****
          </span>
        </a>
        <a
          href="https://wa.me/18000000000"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-green-500 text-white font-semibold rounded-lg px-2 py-2 text-center hover:bg-green-600 transition"
        >
          <span className="flex justify-center items-center gap-2">
            <FaWhatsapp /> Chat on WhatsApp
          </span>
        </a>
      </div>
      <hr className="my-4" />
      <div className="p-4 rounded-xl border border-blue-100 bg-white">
        <div className="flex items-start gap-3 mb-2">
          <FaSuitcaseRolling className="text-blue-500 text-lg" />
          <Typography className="text-sm font-semibold text-blue-700 customfontstitle">
            <span className="font-bold">Deal:</span> {dealtitleform}
          </Typography>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <FaCalendarAlt className="text-blue-500 text-lg" />
          <Typography className="text-sm font-semibold text-blue-700 customfontstitle">
            <span className="font-bold">Date:</span> {selectedDate}
          </Typography>
        </div>

        <div className="flex items-center gap-3">
          <FaUserFriends className="text-blue-500 text-lg" />
          <Typography className="text-sm font-semibold text-blue-700 customfontstitle">
            <span className="font-bold">Adults:</span> {adultCount}
          </Typography>

          <Typography className="text-sm font-semibold text-blue-700 customfontstitle">
            <span className="font-bold">Total:</span> ${totalPrice}
          </Typography>
        </div>
      </div>
      <hr className="my-4" />

      {alert.open && (
        <Alert
          color={alert.type === "success" ? "green" : "red"}
          className="mb-4"
          onClose={() => setAlert((prev) => ({ ...prev, open: false }))}
          dismissible
        >
          {alert.message}
        </Alert>
      )}

      <Typography className="text-sm text-gray-700 mb-2 customfontstitle">
        Or fill out the form below and we will get back to you:
      </Typography>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          type="text"
          label="Enter your name"
          className="p-1"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                {countryCallingCode} {/* Display country code here */}
              </Button>
            </MenuHandler>
            <MenuList className="max-h-[20rem] max-w-[18rem] z-[9999]">
              {countries.map(({ name, flags, countryCallingCode }, index) => (
                <MenuItem
                  key={name}
                  className="flex items-center gap-2"
                  onClick={() => {
                    setCountry(index);
                    setFormData((prev) => ({ ...prev, countryCallingCode })); // Update countryCallingCode when country changes
                  }}
                >
                  <img
                    src={flags.svg}
                    alt={name}
                    className="h-4 w-5 object-cover"
                  />
                  {name} <span className="ml-auto">{countryCallingCode}</span>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Input
            type="tel"
            placeholder="Mobile Number"
            className="rounded-l-none !border-t-blue-gray-200 focus:!border-t-gray-900"
            labelProps={{
              className: "before:content-none after:content-none",
            }}
            containerProps={{ className: "min-w-0" }}
            value={formData.phone} // Only display phone number in input field
            onChange={
              (e) => setFormData({ ...formData, phone: e.target.value }) // Update phone number part only
            }
          />
        </div>

        <Input
          type="email"
          label="Email"
          placeholder="Enter your email"
          icon={<FaEnvelope />}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        <Textarea
          label="How can we help you?"
          rows={3}
          value={formData.message}
          onChange={(e) =>
            setFormData({ ...formData, message: e.target.value })
          }
        />

        {/* Checkbox */}
        <div className="flex items-center gap-2">
          <Checkbox
            id="promo"
            color="blue"
            checked={subscribe}
            onChange={(e) => setSubscribe(e.target.checked)}
          />
          <label
            htmlFor="promo"
            className="text-sm text-gray-700 customfontstitle"
          >
            Subscribe to receive promotional offers, deals, and discounts.
          </label>
        </div>

        <CardFooter className="flex justify-end">
          {/* Submit Button */}
          <Button
            type="submit"
            className="transition-colors duration-500 ease-in-out bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-700 text-white customfontstitle"
          >
            SUBMIT
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ConciergeFormCard;
