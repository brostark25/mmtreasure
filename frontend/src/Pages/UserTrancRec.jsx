import React, { useState } from "react";
import axios from "axios";
import MainLayout from "../Layout/MainLayout";

const TransactionHistory = () => {
  const [activeTab, setActiveTab] = useState("custom"); // Default to custom date range
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [records, setRecords] = useState([]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Set date ranges for tabs
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    switch (tab) {
      case "today":
        setStartDate(today.toISOString().split("T")[0]);
        setEndDate(today.toISOString().split("T")[0]);
        break;
      case "yesterday":
        setStartDate(yesterday.toISOString().split("T")[0]);
        setEndDate(yesterday.toISOString().split("T")[0]);
        break;
      default:
        setStartDate("");
        setEndDate("");
    }
  };

  const handleSearch = async () => {
    try {
      if (activeTab === "custom" && (!startDate || !endDate)) {
        alert("Please select both start and end dates.");
        return;
      }

      // Replace with your API endpoint
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/transactions/history`,
        {
          params: {
            startDate,
            endDate,
            searchTerm,
          },
        }
      );

      if (response.status === 200) {
        setRecords(response.data.records);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      setRecords([]);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white p-5">
        <h1 className="text-xl font-bold mb-4">History</h1>

        {/* Tabs for reports */}
        <div className="flex space-x-4 mb-4 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "today"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleTabChange("today")}
          >
            Today
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "yesterday"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleTabChange("yesterday")}
          >
            Yesterday
          </button>
          <button
            className={`px-4 py-2 rounded ${
              activeTab === "custom"
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300"
            }`}
            onClick={() => handleTabChange("custom")}
          >
            Custom
          </button>
        </div>

        {/* Custom Date Inputs */}
        {activeTab === "custom" && (
          <div className="flex flex-wrap items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white w-full md:w-auto"
            />
            <span className="text-lg hidden md:block">~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white w-full md:w-auto"
            />
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white flex-grow"
            />
            <button
              onClick={handleSearch}
              className="bg-blue-600 px-4 py-2 rounded text-white hover:bg-blue-700 w-full md:w-auto"
            >
              Search
            </button>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse bg-gray-800 rounded-md">
            <thead>
              <tr className="border-b border-gray-700 text-white">
                <th className="p-4">#</th>
                <th className="p-4">Amount</th>
                <th className="p-4">New Balance</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {records.length > 0 ? (
                records.map((record, index) => (
                  <tr key={index} className="border-b border-gray-700">
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{record.amount}</td>
                    <td className="p-4">{record.newBalance}</td>
                    <td className="p-4">{record.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default TransactionHistory;
