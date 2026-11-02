import React, { useState, useContext } from "react";
import { CartContext } from "../../Context/cartContext";
import logoimg from "../../assets/Logo.jpg";
import search from "../../assets/Search.jpeg";
import Cart from "../../assets/Cart.jpeg";
import sidemenu from "../../assets/sideMenu.png";
import { Link, NavLink, useLocation } from "react-router-dom";
import Sidenavbar from "./Sidenavbar";
import LoginForm from "../LoginForm/AuthForm";

function Navbar() {
  const { cart, searchTerm, setSearchTerm, user, logout } = useContext(CartContext);
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const { pathname } = useLocation();

  const totalQuantity = cart?.reduce((sum, item) => sum + Number(item.count || 0), 0);

  const navLinkClass = ({ isActive }) =>
    isActive ? "text-orange-700 font-bold" : "text-black";

  const items = [
    { id: 1, name: "Home", path: "#home", to: "/" },
    { id: 2, name: "Menu", path: "#menu", to: "/" },
    { id: 3, name: "Mobile-app", path: "#mobile-app", to: "/" },
    { id: 4, name: "Contact Us", path: "#contact", to: "/" },
  ];

  return (
    <>
      <nav
        id="home"
        className="fixed top-0 left-0 w-full bg-white shadow-md z-50 flex justify-between items-center px-6 md:px-16 py-3"
      >
        {/* Logo */}
        <div className="hidden sm:block">
          <img
            src={logoimg}
            alt="Logo"
            className="lg:h-30 lg:w-30 md:h-22 md:w-22 rounded-full object-cover"
          />
        </div>

        {/* Mobile hamburger */}
        <div className="block sm:hidden p-1">
          <img
            src={sidemenu}
            alt="Menu"
            className="w-14 h-13 rounded-xl cursor-pointer"
            onClick={() => setOpen(!open)}
          />
          {open && <Sidenavbar onClose={() => setOpen(false)} />}
        </div>

        {/* Nav links */}
        <div className="hidden sm:block">
          <ul className="flex lg:gap-7 md:gap-3 font-bold text-lg cursor-pointer">
            {items.map((item) => (
              <li key={item.id}>
                {item.path.startsWith("#") && pathname === "/" ? (
                  <a
                    href={item.path}
                    className="text-black hover:text-green-600 font-bold md:text-sm lg:text-xl"
                  >
                    {item.name}
                  </a>
                ) : (
                  <NavLink className={navLinkClass} to={item.to}>
                    {item.name}
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Search + Cart */}
        <div className="flex lg:justify-between px-4 pt-2 lg:px-0 lg:py-0 md:w-85 gap-8 lg:w-120 text-gray-400">
          <input
            type="text"
            placeholder="Search food..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-3 h-10 rounded-xl w-55 font-bold text-base sm:w-70"
          />
          <img
            src={search}
            alt="Search"
            className="h-12 w-12 rounded-full hidden lg:block"
          />
          <Link to="/cart">
            <div className="relative">
              <img
                src={Cart}
                alt="Cart"
                className="lg:h-12 lg:w-12 h-10 w-10 object-cover md:mb-0 mb-2 outline-offset-4 rounded-full cursor-pointer"
              />
              <span className="absolute -top-1 -right-5 bg-red-700 text-white text-sm h-5 w-5 flex justify-center items-center rounded-full">
                {totalQuantity || 0}
              </span>
            </div>
          </Link>
        </div>

        {/* Auth */}
        <div>
          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              <span className="font-semibold text-gray-700">Hi, {user.name}</span>
              <button
                onClick={logout}
                className="hover:bg-red-100 hover:scale-[1.05] transform duration-200 bg-gray-200 font-bold lg:text-base md:text-sm shadow-md lg:px-4 lg:py-1 md:px-2 rounded-xl cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              className="hover:bg-gray-300 hover:scale-[1.2] transform duration-200 bg-gray-200 font-bold lg:text-xl md:text-lg shadow-2xl lg:px-5 lg:py-1 md:px-2 md:py-0 rounded-xl cursor-pointer hidden sm:block"
              onClick={() => setShowLogin(true)}
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {showLogin && <LoginForm setShowLogin={setShowLogin} />}
    </>
  );
}

export default Navbar;                                                                                                                                  