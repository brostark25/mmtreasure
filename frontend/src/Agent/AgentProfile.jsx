import React, { useEffect, useState } from "react";
import axios from "axios";
import PerformanceChart from "../util/AperformanceChart";
import Hierarchies from "./Hierarchies";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCog } from "@fortawesome/free-solid-svg-icons";

const AgentProfile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [agentData, setAgentData] = useState({
    agid: "",
    agentname: "",
    balance: "",
    dbalance: "",
    score: "",
    badge: "",
    password_updated: 0, // Track password_updated
  });
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState(""); // Success message
  const [error, setError] = useState(""); // Error message

  // Fetch logged-in agent data
  const fetchAgent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/agent_dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const { agent } = response.data;
        setAgentData({
          agid: agent.agid,
          agentname: agent.agentname,
          balance: agent.balance,
          dbalance: agent.dbalance,
          score: agent.score || "N/A", // Default value if score is unavailable
          badge: agent.badge || "N/A", // Default value if badge is unavailable
          password_updated: agent.password_updated || 0, // Default value for password_updated
        });
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error("Error fetching agent data:", error);
      setIsLoggedIn(false);
    }
  };

  // Handle password update submission
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token"); // Get JWT token from localStorage
      if (!token) throw new Error("No token found");

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/update_password`,
        { agid: agentData.agid, newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        // Set success message and update password_updated to 1
        setMessage(response.data.message);
        setAgentData((prevData) => ({
          ...prevData,
          password_updated: 1, // Update password_updated field in state
        }));
      }

      setError("");
      // setIsModalOpen(false); // Close the modal after successful update
    } catch (err) {
      // Set error message and reset success message
      setError(err.response?.data?.message || "Something went wrong.");
      setMessage("");
    }
  };

  useEffect(() => {
    fetchAgent();
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white p-6 rounded shadow-md flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Agent Profile</h1>
          <button
            className="text-gray-600 hover:text-blue-500 flex items-center"
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faCog} className="h-6 w-6" />
            <span className="ml-2">Settings</span>
          </button>
        </div>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Agent Info */}
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-900 text-center border-b pb-2">
              Agent Overview
            </h3>
            <div className="space-y-4">
              <p className="text-gray-700 text-justify">
                <span className="font-semibold text-gray-900 mr-2">
                  Agent Name:
                </span>
                {agentData.agentname}
              </p>
              <p className="text-gray-700 text-justify">
                <span className="font-semibold text-gray-900 mr-2">
                  Agent ID:
                </span>
                {agentData.agid}
              </p>
              <p className="text-gray-700 text-justify">
                <span className="font-semibold text-gray-900 mr-2">
                  Amount Left:
                </span>
                <span className="text-green-600 font-semibold">
                  {agentData.balance}
                </span>
              </p>
              <p className="text-gray-700 text-justify">
                <span className="font-semibold text-gray-900 mr-2">
                  Downline Balance:
                </span>
                <span className="text-green-600 font-semibold">
                  {agentData.dbalance}
                </span>
              </p>
              <p className="text-gray-700 text-justify">
                <span className="font-semibold text-gray-900 mr-2">
                  Agent Score:
                </span>
                <span className="text-blue-500 font-semibold">
                  {agentData.score}
                </span>
              </p>
              <p className="text-gray-700 text-justify">
                <span className="font-semibold text-gray-900 mr-2">Badge:</span>
                <span className="text-yellow-500 font-semibold">
                  {agentData.badge}
                </span>
              </p>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white p-6 rounded shadow-md">
            <h3 className="text-lg font-bold mb-4">Performance Chart</h3>
            <PerformanceChart />
          </div>
        </div>

        {/* Hierarchies */}
        <Hierarchies />

        {/* Modal for password update */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Update Password
              </h3>

              {/* Show success or error message inside the modal */}
              {message && (
                <p className="text-green-500 text-sm mb-4">{message}</p>
              )}
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <form onSubmit={handlePasswordUpdate}>
                <div className="mb-4">
                  <label className="block text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end mt-6 space-x-4">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-6 py-2 rounded"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 text-gray-800 px-6 py-2 rounded"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentProfile;
