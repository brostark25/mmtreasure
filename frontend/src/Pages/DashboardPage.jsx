import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimes,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import LeftNavigation from "../Agent/LeftNavigation";
import MainContent from "../Agent/MainContent";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [tabHistory, setTabHistory] = useState([]); // Keep track of tab history
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar toggle
  const navigate = useNavigate();

  const fetchAgentData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/agent_dashboard`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const { agent } = response.data;
        if (["Admin", "Agent"].includes(agent.arole)) {
          setAgentData(agent);
          setIsLoggedIn(true);
        } else {
          throw new Error("Invalid role");
        }
      } else {
        throw new Error("Failed to fetch agent data");
      }
    } catch (error) {
      console.error("Error fetching agent data:", error);
      setIsLoggedIn(false);
      localStorage.removeItem("token");
      navigate("/agent-login");
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, []);

  const handleTabChange = (newTab) => {
    setTabHistory((prevHistory) => [...prevHistory, activeTab]); // Save the current tab before switching
    setActiveTab(newTab);
  };

  const handleBackNavigation = () => {
    if (tabHistory.length > 0) {
      const lastTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prevHistory) => prevHistory.slice(0, -1)); // Remove the last tab from history
      setActiveTab(lastTab); // Navigate back to the last tab
    }
  };

  const handleOutsideClick = (e) => {
    if (
      isSidebarOpen &&
      !e.target.closest(".sidebar") &&
      !e.target.closest(".menu-button")
    ) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isSidebarOpen]);

  if (!isLoggedIn) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Top Bar */}
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 md:hidden">
        <button
          className="text-xl menu-button"
          onClick={handleBackNavigation} // Navigate back to the previous tab
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <button
          className="text-xl menu-button"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <FontAwesomeIcon icon={isSidebarOpen ? faTimes : faBars} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 sidebar ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <LeftNavigation
            activeTab={activeTab}
            setActiveTab={handleTabChange}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-100 p-4">
          <MainContent activeTab={activeTab} agentData={agentData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
