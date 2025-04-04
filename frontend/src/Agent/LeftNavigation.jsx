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
    { name: "Dashboard", mmname: "ဒက်ဂျ်ဘုတ်ဒ်", icon: faGauge },
    { name: "Profile", mmname: "ပရိုဖိုင်", icon: faUser },
    { name: "Account", mmname: "အေးဂျင့်အကောင့်များ", icon: faTable },
    { name: "iBet Agent", mmname: "iBet Agent", icon: faUserPen },
    {
      name: "Win/Lose Report",
      mmname: "အနိုင်/အရှုံးတင်ပြချက်",
      icon: faChartLine,
    },
    {
      name: "Transaction Report",
      mmname: "ငွေသွင်း/ထုတ်တင်ပြချက်",
      icon: faMoneyBillTransfer,
    },
    { name: "Score Log", mmname: "စကိုးလော့ဂျ်", icon: faCalculator },
    { name: "Game Log", mmname: "ဂိမ်းလော့ဂျ်", icon: faDiamond },
    { name: "Action Log", mmname: "လုပ်ဆောင်မှုလော့ဂျ်", icon: faFile },
    { name: "Sub Account", mmname: "အကောင့်ခွဲ", icon: faSubscript },
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
              <span className="text-sm">{item.mmname}</span>
            </li>
          ))}
          <li
            className="flex items-center space-x-3 py-2 px-4 rounded-md hover:bg-gray-700 cursor-pointer transition"
            onClick={handleLogout}
          >
            <FontAwesomeIcon icon={faSignOutAlt} />
            <span className="text-sm">အကောင့်ထွက်မည်</span>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default LeftNavigation;
