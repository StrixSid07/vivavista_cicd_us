import {
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
  HomeModernIcon,
  PhotoIcon,
  SwatchIcon,
  TagIcon,
  NewspaperIcon,
  CreditCardIcon,
  ServerStackIcon,
  TicketIcon,
  StopCircleIcon,
  PaperAirplaneIcon,
  DocumentArrowUpIcon,
  UserIcon,
  VideoCameraIcon,
  FilmIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/24/solid";
import {
  ManageHotel,
  ManageDestination,
  ManageUsers,
  ManageFaqs,
  ManageTerms,
  ManageDeals,
  ManagePrices,
  ManageCarousel,
  ManageHolidayCategorie,
  ManageBlog,
  ManageBooking,
  ManageBoardBasis,
  ManageAirports,
  ManageDealExternal,
  AdminVideoTutorials,
  ManageNewsletter,
  ManageAutoslider,
} from "@/pages/dashboard";
import { LogIn } from "@/pages/auth";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <UserIcon {...icon} />,
        name: "Manage Users",
        path: "/manage-users",
        element: <ManageUsers />,
      },
      {
        icon: <PaperAirplaneIcon {...icon} />,
        name: "Manage Airports",
        path: "/manage-airports",
        element: <ManageAirports />,
      },
      {
        icon: <TicketIcon {...icon} />,
        name: "Manage Booking",
        path: "/manage-booking",
        element: <ManageBooking />,
      },
      {
        icon: <HomeModernIcon {...icon} />,
        name: "Manage Hotels",
        path: "/manage-hotel",
        element: <ManageHotel />,
      },
      {
        icon: <TagIcon {...icon} />,
        name: "Manage H Categories",
        path: "/Manage-holiday-categories",
        element: <ManageHolidayCategorie />,
      },
      {
        icon: <StopCircleIcon {...icon} />,
        name: "Manage BoardBasis",
        path: "/Manage-BoardBasis",
        element: <ManageBoardBasis />,
      },
      {
        icon: <MapPinIcon {...icon} />,
        name: "Manage Destination",
        path: "/manage-destination",
        element: <ManageDestination />,
      },
      {
        icon: <NewspaperIcon {...icon} />,
        name: "Manage Newslatter",
        path: "/manage-newslatter",
        element: <ManageNewsletter />,
      },
      {
        icon: <CreditCardIcon {...icon} />,
        name: "Manage Blog",
        path: "/manage-blog",
        element: <ManageBlog />,
      },
      {
        icon: <SwatchIcon {...icon} />,
        name: "Manage Deals",
        path: "/manage-deals",
        element: <ManageDeals />,
      },
      {
        icon: <CurrencyDollarIcon {...icon} />,
        name: "Manage Prices",
        path: "/manage-prices",
        element: <ManagePrices />,
      },
      {
        icon: <DocumentArrowUpIcon {...icon} />,
        name: "Manage DealsExternal",
        path: "/manage-external-deals",
        element: <ManageDealExternal />,
      },
      {
        icon: <QuestionMarkCircleIcon {...icon} />,
        name: "Manage Faqs",
        path: "/manage-faqs",
        element: <ManageFaqs />,
      },
      {
        icon: <CheckCircleIcon {...icon} />,
        name: "Manage Terms",
        path: "/manage-terms",
        element: <ManageTerms />,
      },
      {
        icon: <PhotoIcon {...icon} />,
        name: "Manage Carousel",
        path: "/manage-carousel",
        element: <ManageCarousel />,
      },
      {
        icon: <FilmIcon {...icon} />,
        name: "Manage Autoslider",
        path: "/manage-autoslider",
        element: <ManageAutoslider />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <LogIn />,
      },
    ],
  },
  {
    title: "Tutorials",
    layout: "dashboard",
    pages: [
      {
        icon: <VideoCameraIcon {...icon} />,
        name: "Video Tutorial",
        path: "/video-tutorial",
        element: <AdminVideoTutorials />,
      },
    ],
  },
];

export default routes;
