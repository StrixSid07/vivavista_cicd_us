const tripData = {
  title: "Luxury Trip to Maldives - 6 Nights",
  description:
    "Enjoy an all-inclusive 5-night stay in a beachfront resort in the Maldives.",
  destination: { name: "Maldives", country: "Maldives" },
  overview:
    "Experience an unforgettable tropical getaway in the Maldives. Relax in a luxurious resort with pristine beaches and crystal-clear waters.",
  boardBasis: "All Inclusive",
  distanceToCenter: "1km",
  distanceToBeach: "50m",
  isTopDeal: true,
};

const itinerary = [
  {
    day: 1,
    title: "Arrival & Resort Check-in",
    description:
      "Arrive at the Maldives airport and enjoy a speedboat transfer to the resort. Check-in and relax by the beach.",
    icon: <FaPlaneArrival className="text-[#FF6B6B] text-xl" />,
  },
  {
    day: 2,
    title: "Snorkeling & Water Sports",
    description:
      "Explore the underwater world with a guided snorkeling session. Enjoy kayaking and paddleboarding.",
    icon: <FaUmbrellaBeach className="text-[#FF6B6B] text-xl" />,
  },
  {
    day: 3,
    title: "Island Hopping Tour",
    description:
      "Visit nearby islands, experience local culture, and enjoy a private beach picnic.",
    icon: <FaShip className="text-[#FF6B6B] text-xl" />,
  },
  {
    day: 4,
    title: "Spa & Sunset Cruise",
    description:
      "Relax with a luxury spa treatment followed by a romantic sunset cruise with dolphin watching.",
    icon: <FaSpa className="text-[#FF6B6B] text-xl" />,
  },
  {
    day: 5,
    title: "Departure",
    description: "Enjoy a farewell breakfast before your flight back home.",
    icon: <FaPlaneDeparture className="text-[#FF6B6B] text-xl" />,
  },
];

const prices = [
  {
    country: "UK",
    airport: "LHR",
    date: "2025-04-10T00:00:00.000Z",
    price: 1500,
  },
  {
    country: "USA",
    airport: "JFK",
    date: "2025-04-15T00:00:00.000Z",
    price: 1800,
  },
  {
    country: "Canada",
    airport: "YYZ",
    date: "2025-04-20T00:00:00.000Z",
    price: 1700,
  },
  {
    country: "UK",
    airport: "LGW",
    date: "2025-04-12T00:00:00.000Z",
    price: 1600,
  },
];
