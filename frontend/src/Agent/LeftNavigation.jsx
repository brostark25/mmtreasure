import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGauge,
  faUser,
  faTable,
  faChartLine,
  faDiamond,
  faFile,
  faSubscript,
  faSignOutAlt,
  faMoneyBillTransfer,
  faUserPen,
  faCalculator,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const LeftNavigation = ({ activeTab, setActiveTab }) => {
  const navigationItems = [
    { name: "Dashboard", icon: faGauge },
    { name: "Profile", icon: faUser },
    { name: "Account", icon: faTable },
    { name: "iBet Agent", icon: faUserPen },
    { name: "Win/Lose Report", icon: faChartLine },
    { name: "Transaction Report", icon: faMoneyBillTransfer },
    { name: "Score Log", icon: faCalculator },
    { name: "Game Log", icon: faDiamond },
    { name: "Action Log", icon: faFile },
    { name: "Sub Account", icon: faSubscript },
  ];

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You are not logged in!");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/logout`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert("Logout successful!");
        localStorage.removeItem("token");
        window.location.href = "/agent-login";
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="h-full bg-gray-800 text-white flex flex-col">
      <div className="p-4 bg-gray-900 flex items-center justify-center">
        <img className="w-20" src="logo.png" alt="Logo" />
      </div>
      <nav className="flex-1 overflow-auto p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li
              key={item.name}
              className={`flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer transition ${
                activeTab === item.name ? "bg-gray-700" : ""
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <FontAwesomeIcon icon={item.icon} />
              <span className="text-sm">{item.name}</span>
            </li>
          ))}
          <li
            className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer transition"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="text-sm">Logout</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default LeftNavigation;
