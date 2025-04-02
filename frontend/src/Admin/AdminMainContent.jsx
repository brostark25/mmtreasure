import React, { useState } from "react";
import Overview from "./Overview";
import AdminAgentManagement from "./AdminAgentManagement";
import AdminUserManagement from "./AdminUserManagement";
import AgentProfile from "../Agent/AgentProfile";
import WinLoseReport from "../Agent/WinLoseReport";
import TransactionPage from "../Agent/Transaction";
import ScoreLog from "../Agent/ScoreLog";
import GameLog from "../Agent/GameLog";
import { FiLogOut } from "react-icons/fi";
import axios from "axios";

const AdminMainContent = ({ activeTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const renderContent = () => {
    switch (activeTab) {
      case "Overview":
        return <Overview />;
      case "Profile":
        return <AgentProfile />;
      // case "Profile":
      //   return <UpdatePassword />;
      case "Agents":
        return <AdminAgentManagement />;
      case "Users":
        return <AdminUserManagement />;
      case "Win/Lose Report":
        return <WinLoseReport />;
      case "Transaction Report":
        return <TransactionPage />;
      case "Score Log":
        return <ScoreLog />;
      case "Game Log":
        return <GameLog />;
      case "Action Log":
        return <div className="p-4">This is the Action Log section.</div>;
      case "Sub Account":
        return <div className="p-4">This is the Sub Account section.</div>;
      default:
        return <Overview />;
    }
  };

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
    <div className="flex-1 bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">{activeTab}</div>
        <button
          onClick={handleLogout}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          <FiLogOut className="mr-0" size={20} />
          {sidebarOpen && <span>အကောင့်ထွက်ရန်</span>}
        </button>
      </div>

      <div className="bg-white shadow-md rounded-md">{renderContent()}</div>
    </div>
  );
};

export default AdminMainContent;
