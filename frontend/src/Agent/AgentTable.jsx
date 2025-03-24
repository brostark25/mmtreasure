import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMinus,
  faKey,
  faCopy,
  faLock,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const AgentTable = ({
  agents,
  onAddBalance,
  onWithdrawBalance,
  onShowAllAgents,
  onAddAgent,
  onUpdatePassword,
  onEditActiveStatus,
  isReferralAgent,
  agentCount,
  userCount,
}) => {
  const [selectedAgentDetails, setSelectedAgentDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Function to fetch created agents and users for a specific agent
  const fetchAgentDetails = async (agentId) => {
    setIsLoadingDetails(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/report/created-agents-and-users`,
        {
          params: { agentID: agentId },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setSelectedAgentDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching agent details:", error);
      alert("Failed to fetch agent details. Please try again.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-md p-4">
      <div className="flex flex-wrap justify-between items-center mb-4">
        <h2 className="text-lg sm:text-xl font-bold">Agent</h2>
        <button
          onClick={onAddAgent}
          className="bg-blue-500 text-white px-3 py-2 rounded-md flex items-center space-x-2"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Agent</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-200 text-xs sm:text-sm">
              <th className="border p-2">Agent ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Your Balance</th>
              <th className="border p-2">Downline Balance</th>
              <th className="border p-2">Function</th>
              <th className="border p-2">Status</th>
              <th className="border p-2">Last Login/Created Time</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr key={agent.agid}>
                <td
                  className="border p-2 cursor-pointer"
                  onClick={() => fetchAgentDetails(agent.agid)}
                >
                  {agent.agid}
                  <span className="bg-[#4264ac] text-white p-1 rounded-xl">
                    A{agentCount[agent.agid] || 0}
                  </span>{" "}
                  <span>U{userCount[agent.agid] || 0}</span>
                </td>
                <td className="border p-2">{agent.agentname}</td>
                <td className="border p-2">{agent.balance}</td>
                <td className="border p-2">{agent.dbalance}</td>
                <td className="border p-2">
                  <div className="flex space-x-2">
                    {!isReferralAgent && (
                      <>
                        <button
                          className="text-blue-500"
                          onClick={() => onAddBalance(agent)}
                        >
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                        <button
                          className="text-blue-500"
                          onClick={() => onWithdrawBalance(agent)}
                        >
                          <FontAwesomeIcon icon={faMinus} />
                        </button>
                      </>
                    )}

                    <button
                      className="text-blue-500"
                      onClick={() => onUpdatePassword(agent)}
                    >
                      <FontAwesomeIcon icon={faKey} />
                    </button>
                    <button className="text-blue-500">
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <button
                      className="text-blue-500"
                      onClick={() => onEditActiveStatus(agent)}
                    >
                      <FontAwesomeIcon icon={faLock} />
                    </button>
                  </div>
                </td>
                <td className="border p-2">
                  {agent.active ? "Active" : "Inactive"}
                </td>
                <td className="border p-2">{agent.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="text-blue-500 mt-4" onClick={onShowAllAgents}>
        More...
      </button>

      {/* Display created agents and users for the selected agent */}
      {selectedAgentDetails && (
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-4">
            Created Agents and Users
          </h3>
          {isLoadingDetails ? (
            <div>Loading...</div>
          ) : (
            <>
              <h4 className="text-md font-semibold mb-2">Created Agents</h4>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Agent ID</th>
                     <th className="border p-2">Agent Balance</th>
                     <th className="border p-2">Agent Downline Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAgentDetails.agents.map((agent) => (
                    <tr key={agent.agid}>
                      <td className="border p-2">{agent.agid}</td>
                      <td className="border p-2">{agent.balance}</td>
                      <td className="border p-2">{agent.dbalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4 className="text-md font-semibold mt-4 mb-2">Created Players</h4>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">Player ID</th>
                    <th className="border p-2">Player Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAgentDetails.users.map((user) => (
                    <tr key={user.uid}>
                      <td className="border p-2">{user.uid}</td>
                      <td className="border p-2">{user.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentTable;