import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGamepad,
  faHome,
  faHouseChimneyUser,
  faPhoneVolume,
  faReceipt,
} from "@fortawesome/free-solid-svg-icons";

const FrontMenu = () => {
  const { t, i18n } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(true); // Mobile menu open by default
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userBalance, setUserBalance] = useState(null);
  const [userCurrency, setUserCurrency] = useState(null);

  // Helper function to check if the token is expired
  const isTokenExpired = (token) => {
    try {
      const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const currentTime = Math.floor(Date.now() / 1000);
      return decodedToken.exp < currentTime; // Check if the token is expired
    } catch (error) {
      console.error("Error decoding token:", error);
      return true; // Assume expired if decoding fails
    }
  };

  // UseEffect to handle token status and user state
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !isTokenExpired(token)) {
      setIsLoggedIn(true);
      fetchUserBalance(token);
    } else {
      localStorage.removeItem("token"); // Remove expired token
      setIsLoggedIn(false);
    }
  }, []);

  // Function to fetch user balance and currency
  const fetchUserBalance = async (token) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/uhome`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const { balance, currency } = response.data.user;
      setUserBalance(balance);
      setUserCurrency(currency);
    } catch (error) {
      console.error("Failed to fetch user balance:", error);
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        window.location.href = "/login"; // Redirect to login on error
      }
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user/logout`,
        {},
        { withCredentials: true }
      );
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Function to change the app's language
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <>
      <header className="bg-white fixed w-full z-50 shadow-sm">
        <div className="container mx-auto flex justify-between items-center py-6 px-4">
          <div className="text-2xl font-bold text-gray-800">MM Treasure</div>
          {/* Desktop Navigation (hidden on small screens) */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li>
                <Link
                  to={"/"}
                  className="text-gray-700 hover:text-blue-500 transition duration-300"
                >
                  ပင်မစာမျက်နှာ
                </Link>
              </li>
              <li>
                <Link
                  to={"/2d3d"}
                  className="text-gray-700 hover:text-blue-500 transition duration-300"
                >
                  2d/3d
                </Link>
              </li>
              <li>
                <Link
                  to={"/slot"}
                  className="text-gray-700 hover:text-blue-500 transition duration-300"
                >
                  စလော့ဂိမ်း
                </Link>
              </li>
              {!isLoggedIn && (
                <li>
                  <Link
                    to={"/login"}
                    className="text-gray-700 hover:text-blue-500 transition duration-300"
                  >
                    အကောင့်ဝင်ရန်
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to={"/contact"}
                  className="text-gray-700 hover:text-blue-500 transition duration-300"
                >
                  ဆက်သွယ်ရန်
                </Link>
              </li>

              {isLoggedIn && (
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-gray-700 hover:text-blue-500 transition duration-300"
                  >
                    {t("logout")}
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* Mobile Menu (visible on small screens by default) */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white shadow-lg z-40 transition-transform duration-300 ${
          isMenuOpen ? "translate-y-0" : "translate-y-full"
        } md:hidden`}
      >
        <ul className="flex flex-row space-x-16 p-4 items-center">
          <li>
            <Link
              to={"/"}
              className="text-gray-700 hover:text-blue-500 transition duration-300"
            >
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>
          <li>
            <Link
              to={"/2d3d"}
              className="text-gray-700 hover:text-blue-500 transition duration-300"
            >
              <FontAwesomeIcon icon={faReceipt} />
            </Link>
          </li>
          <li>
            <Link
              to={"/slot"}
              className="text-gray-700 hover:text-blue-500 transition duration-300"
            >
              <FontAwesomeIcon icon={faGamepad} />
            </Link>
          </li>
          <li>
            <Link
              to={"/login"}
              className="text-gray-700 hover:text-blue-500 transition duration-300"
            >
              <FontAwesomeIcon icon={faHouseChimneyUser} />
            </Link>
          </li>
          <li>
            <Link
              to={"/contact"}
              className="text-gray-700 hover:text-blue-500 transition duration-300"
            >
              <FontAwesomeIcon icon={faPhoneVolume} />
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default FrontMenu;
