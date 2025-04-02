// src/pages/Overview.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiTrendingUp,
} from "react-icons/fi";
import AgentRegister from "../Agent/AgentReg";
import PlayerRegister from "../Agent/PlayerRegister";

const Overview = () => {
  const [agents, setAgents] = useState([]);
  const [totalAgents, setTotalAgents] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token");
      const agentsResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/agents`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedAgents = agentsResponse.data.agents;
      setAgents(fetchedAgents);
      setTotalAgents(fetchedAgents.length);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const usersResponse = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/users`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fetchedUsers = usersResponse.data.users;
      setTotalUsers(fetchedUsers.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Callback to handle adding a new user
  const handleAddUser = (newUser) => {
    setTotalUsers((prev) => prev + 1);
    fetchUsers(); // Refresh user data
  };

  // Callback to handle adding a new agent
  const handleAddAgent = (newAgent) => {
    setTotalAgents((prev) => prev + 1);
    fetchAgents(); // Refresh agent data
  };

  useEffect(() => {
    fetchAgents();
    fetchUsers();
  }, []);

  const stats = [
    {
      title: "ကစားသမားအားလုံးပေါင်း",
      value: loading ? "Loading..." : totalUsers.toLocaleString(),
      icon: <FiUsers size={24} />,
      change: "+12%",
      trend: "up",
    },
    {
      title: "အေးဂျင့်အားလုံးပေါင်း",
      value: loading ? "Loading..." : totalAgents.toLocaleString(),
      icon: <FiUserCheck size={24} />,
      change: "+5%",
      trend: "up",
    },
    {
      title: "Total Bets",
      value: "5,672",
      icon: <FiDollarSign size={24} />,
      change: "+23%",
      trend: "up",
    },
    {
      title: "Revenue",
      value: "$28,540",
      icon: <FiTrendingUp size={24} />,
      change: "+18%",
      trend: "up",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p
                  className={`text-sm mt-2 ${
                    stat.trend === "up" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stat.change} from last week
                </p>
              </div>
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">လက်ရှိလှုပ်ရှားမှုများ</h3>
          {loading ? (
            <div className="text-gray-500 text-center py-8">
              Loading activity...
            </div>
          ) : (
            <div className="space-y-4">
              {agents.slice(0, 3).map((agent) => (
                <div
                  key={agent.agid}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded"
                >
                  <div className="bg-indigo-100 text-indigo-600 p-2 rounded-full">
                    <FiUserCheck size={18} />
                  </div>
                  <div>
                    <p className="font-medium">{agent.agentname}</p>
                    <p className="text-sm text-gray-500">
                      ရမှတ်များ: {agent.score}%
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <button className="text-indigo-600 text-sm hover:underline">
                  လှုပ်ရှားမှုအားလုံးကြည့်မည်
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="font-semibold mb-4">အမြန်လုပ်ဆောင်ရန်</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              className="bg-indigo-100 text-indigo-700 p-4 rounded-lg hover:bg-indigo-200 transition flex flex-col items-center"
              onClick={() => setIsPlayerModalOpen(true)}
            >
              <FiUsers size={20} className="mb-2" />
              ကစားသမားအသစ်ထည့်ရန်
            </button>
            <button
              className="bg-green-100 text-green-700 p-4 rounded-lg hover:bg-green-200 transition flex flex-col items-center"
              onClick={() => setIsAgentModalOpen(true)}
            >
              <FiUserCheck size={20} className="mb-2" />
              အေးဂျင့်အသစ်ထည့်ရန်
            </button>
            <button
              className="bg-blue-100 text-blue-700 p-4 rounded-lg hover:bg-blue-200 transition flex flex-col items-center"
              onClick={() => {
                /* View reports logic */
              }}
            >
              <FiDollarSign size={20} className="mb-2" />
              တင်ပြချက်များကြည့်ရန်
            </button>
            <button
              className="bg-purple-100 text-purple-700 p-4 rounded-lg hover:bg-purple-200 transition flex flex-col items-center"
              onClick={() => {
                /* Settings logic */
              }}
            >
              <FiTrendingUp size={20} className="mb-2" />
              ဆက်တင်
            </button>
          </div>
        </div>
      </div>

      {/* Add Agent Modal */}
      <AgentRegister
        isOpen={isAgentModalOpen}
        onClose={() => setIsAgentModalOpen(false)}
        onAgentAdded={handleAddAgent}
      />

      {/* Add Player Modal */}
      <PlayerRegister
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
        onUserAdded={handleAddUser}
      />
    </div>
  );
};

export default Overview;
