import React, { useState } from "react";

const Hierarchies = () => {
  const [showAgentSearch, setShowAgentSearch] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [agentSearchQuery, setAgentSearchQuery] = useState("");
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const [agents, setAgents] = useState([
    { name: "John Doe", role: "Top Agent", status: "active" },
    { name: "Sarah Connor", role: "Senior Agent", status: "inactive" },
    { name: "Michael Scott", role: "Junior Agent", status: "active" },
  ]);

  const [users, setUsers] = useState([
    { name: "User 1", team: "John’s Team" },
    { name: "User 2", team: "Sarah’s Team" },
    { name: "User 3", team: "Michael’s Team" },
  ]);

  const toggleAgentStatus = (name) => {
    setAgents((prevAgents) =>
      prevAgents.map((agent) =>
        agent.name === name
          ? {
              ...agent,
              status: agent.status === "active" ? "inactive" : "active",
            }
          : agent
      )
    );
  };

  const editUser = (name) => {
    alert(`Edit user: ${name}`);
  };

  const deleteUser = (name) => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.name !== name));
    alert(`Deleted user: ${name}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 p-6">
      {/* Agent Hierarchy */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Agent Hierarchy
          </h3>
          <button
            className="text-gray-600 hover:text-blue-500"
            onClick={() => setShowAgentSearch(!showAgentSearch)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zm-1.4-2.9a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {showAgentSearch && (
          <input
            type="text"
            placeholder="Search Agent..."
            className="mb-4 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setAgentSearchQuery(e.target.value)}
          />
        )}
        <ul className="space-y-4">
          {agents
            .filter((agent) =>
              agent.name.toLowerCase().includes(agentSearchQuery.toLowerCase())
            )
            .map((agent, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm"
              >
                <div className="text-gray-800">
                  <p className="font-semibold">{agent.name}</p>
                  <p className="text-sm text-gray-500">{agent.role || ""}</p>
                </div>
                <button
                  className={`py-1 px-3 rounded-full font-semibold ${
                    agent.status === "active"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                  onClick={() => toggleAgentStatus(agent.name)}
                >
                  {agent.status === "active" ? "Active" : "Inactive"}
                </button>
              </li>
            ))}
        </ul>
      </div>

      {/* User Hierarchy */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            User Hierarchy
          </h3>
          <button
            className="text-gray-600 hover:text-blue-500"
            onClick={() => setShowUserSearch(!showUserSearch)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l4.387 4.387a1 1 0 01-1.414 1.414l-4.387-4.387zm-1.4-2.9a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        {showUserSearch && (
          <input
            type="text"
            placeholder="Search User..."
            className="mb-4 w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setUserSearchQuery(e.target.value)}
          />
        )}
        <ul className="space-y-4">
          {users
            .filter((user) =>
              user.name.toLowerCase().includes(userSearchQuery.toLowerCase())
            )
            .map((user, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 p-4 rounded-md shadow-sm"
              >
                <div className="text-gray-800">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.team}</p>
                </div>
                <div className="space-x-2">
                  <button
                    className="py-1 px-3 bg-blue-100 text-blue-600 rounded-full font-semibold hover:bg-blue-200"
                    onClick={() => editUser(user.name)}
                  >
                    Edit
                  </button>
                  <button
                    className="py-1 px-3 bg-red-100 text-red-600 rounded-full font-semibold hover:bg-red-200"
                    onClick={() => deleteUser(user.name)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default Hierarchies;
