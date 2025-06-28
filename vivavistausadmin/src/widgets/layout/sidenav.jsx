import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, UserIcon } from "@heroicons/react/24/outline";
import { Button, IconButton, Typography } from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

const user = JSON.parse(localStorage.getItem("authUser"));

export function Sidenav({ brandImg, brandName, routes }) {
  const sidenavRef = useRef(null);
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  // Detect click outside to close (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        openSidenav &&
        sidenavRef.current &&
        !sidenavRef.current.contains(event.target) &&
        window.innerWidth < 1280
      ) {
        setOpenSidenav(dispatch, false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openSidenav, dispatch]);

  // Close sidenav on nav click (mobile only)
  const handleNavClick = () => {
    if (window.innerWidth < 1280) {
      setOpenSidenav(dispatch, false);
    }
  };

  return (
    <>
      {/* Backdrop for mobile click-outside */}
      {openSidenav && window.innerWidth < 1280 && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50" />
      )}

      <aside
        ref={sidenavRef}
        className={`${sidenavTypes[sidenavType]} ${
          openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-y-0 left-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl border border-blue-gray-100 transition-transform duration-300 xl:translate-x-0`}
      >
        <div className="relative">
          <Link to="/" className="px-8 py-6 text-center">
            <Typography
              variant="h6"
              color={sidenavType === "dark" ? "white" : "blue"}
              className="flex items-center justify-center gap-2"
            >
              <UserIcon strokeWidth={3} className="h-4 w-4 text-blue-500" />
              {brandName}
            </Typography>
          </Link>
          {/* Mobile Close Button */}
          <IconButton
            variant="text"
            color="white"
            size="sm"
            ripple={false}
            className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none bg-gray-200 xl:hidden"
            onClick={() => setOpenSidenav(dispatch, false)}
          >
            <XMarkIcon strokeWidth={4} className="h-5 w-5 text-red-500" />
          </IconButton>
        </div>

        <div
          className={`m-4 h-[calc(100vh-32px-96px)]  overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-500`}
        >
          {routes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mb-2 mt-4">
                  <Typography
                    variant="small"
                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                    className="font-black uppercase opacity-75"
                  >
                    {title}
                  </Typography>
                </li>
              )}
              {pages.map(({ icon, name, path }) => (
                <li key={name}>
                  <NavLink to={`/${layout}${path}`} onClick={handleNavClick}>
                    {({ isActive }) => (
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={
                          isActive
                            ? sidenavColor
                            : sidenavType === "dark"
                            ? "white"
                            : "blue-gray"
                        }
                        className="flex items-center gap-4 px-4 capitalize"
                        fullWidth
                      >
                        {icon}
                        <Typography
                          color="inherit"
                          className="font-medium capitalize"
                        >
                          {name}
                        </Typography>
                      </Button>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </aside>
    </>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/faviocn.ico",
  brandName: user?.name ?? "Admin",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
