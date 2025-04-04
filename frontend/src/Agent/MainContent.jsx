import React from "react";
import AgentAccount from "./AgentAccount";
import Dashboard from "./Dashboard";
import AgentProfile from "./AgentProfile";
import WinLoseReport from "./WinLoseReport";
import GameLog from "./GameLog";
import TransactionPage from "./Transaction";
import IbetAgent from "./iBetAgent";
import UpdatePassword from "./Test";
import ScoreLog from "./ScoreLog";

const MainContent = ({ activeTab }) => {
  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <Dashboard />;
      case "Profile":
        return <AgentProfile />;
      // case "Profile":
      //   return <UpdatePassword />;
      case "Account":
        return <AgentAccount />;
      case "iBet Agent":
        return <IbetAgent />;
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
        return <Dashboard />;
    }
  };

  return (
    <div className="flex-1 bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-2xl font-bold">{activeTab}</div>
        {/* <button className="bg-blue-500 text-white px-4 py-2 rounded-md">
          Language
        </button> */}
      </div>

      <div className="bg-white shadow-md rounded-md">{renderContent()}</div>
    </div>
  );
};

export default MainContent;
