import { Outlet, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiTrendingUp,
  FiFile,
  FiPieChart,
  FiDollarSign as FiDollarSignAlt,
  FiBook,
} from "react-icons/fi";
import axios from "axios";

const AdminDashboard = ({ activeTab, setActiveTab }) => {
  const navigationItems = [
    { name: "Overview", mmname: "အကြမ်းဖျင်း", icon: FiHome },
    { name: "Profile", mmname: "ပရိုဖိုင်", icon: FiUsers },
    { name: "Agents", mmname: "အေးဂျင့်များ", icon: FiUserCheck },
    { name: "Users", mmname: "ကစားသမားများ", icon: FiUsers },
    {
      name: "Win/Lose Report",
      mmname: "အနိုင်/အရှုံးတင်ပြချက်",
      icon: FiTrendingUp,
    },
    {
      name: "Transaction Report",
      mmname: "ငွေသွင်း/ထုတ်တင်ပြချက်",
      icon: FiDollarSign,
    },
    { name: "Score Log", mmname: "စကိုးလော့ဂျ်", icon: FiBook },
    { name: "Game Log", mmname: "ဂိမ်းလော့ဂျ်", icon: FiPieChart },
    { name: "Action Log", mmname: "လုပ်ဆောင်မှုလော့ဂျ်", icon: FiFile },
    { name: "Sub Account", mmname: "အကောင့်ခွဲ", icon: FiUserCheck }, // Changed from faSubscript to FiUserCheck
  ];

  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`bg-indigo-800 text-white transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold">MM Treasure</h1>
          ) : (
            <div className="w-8 h-8 bg-indigo-700 rounded-full"></div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white"
          >
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        <nav className="mt-8">
          <ul>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li
                  key={item.name}
                  className={`flex items-center p-3 hover:bg-indigo-700 cursor-pointer ${
                    activeTab === item.name ? "bg-gray-700" : ""
                  }`}
                  onClick={() => setActiveTab(item.name)}
                >
                  <IconComponent className="mr-3" size={20} />
                  {sidebarOpen && <span>{item.mmname}</span>}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default AdminDashboard;
