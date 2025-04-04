import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [agents, setAgents] = useState([]);
  const [totalAgents, setTotalAgents] = useState(0);
  const [agentOfTheMonth, setAgentOfTheMonth] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [agentCounts, setAgentCounts] = useState({});
  const [userCounts, setUserCounts] = useState({});
  const [currentAgent, setCurrentAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Format number with commas and 2 decimal places
  const formatBalance = (value) => {
    if (value === undefined || value === null) return "0.00";
    const num = parseFloat(value);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchLoggedInAgent = async () => {
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
        setCurrentAgent(response.data.agent);
      }
    } catch (error) {
      console.error("Error fetching agent data:", error);
    }
  };

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const [agentsResponse, countsResponse, userCountsResponse] =
        await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/admin/agents`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/admin/agent_count`),
          axios.get(`${import.meta.env.VITE_API_URL}/user/user_count`),
        ]);

      const fetchedAgents = agentsResponse.data.agents;
      setAgents(fetchedAgents);
      setTotalAgents(fetchedAgents.length);
      setAgentCounts(countsResponse.data);
      setUserCounts(userCountsResponse.data);

      // Calculate "Agent of the Month" based on score
      const topAgent = fetchedAgents.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );
      setAgentOfTheMonth(topAgent);
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setLoading(false);
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
      setUsers(fetchedUsers);
      setTotalUsers(fetchedUsers.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchLoggedInAgent();
    fetchAgents();
    fetchUsers();
  }, []);

  // Chart data for Sales Score
  const salesChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sales Score (%)",
        data: agents.map((agent) => agent.score),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.4,
      },
    ],
  };

  const salesChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Sales Performance Over Time",
      },
    },
  };

  return (
    <>
      <div className="bg-gray-100 p-6">
        {/* Dashboard Header */}
        <header className="text-2xl font-bold mb-6">Dashboard</header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Stats Cards */}
          <div className="bg-white p-6 rounded shadow flex items-center space-x-4">
            <div className="text-4xl">👨‍💼</div>
            <div>
              <p className="text-gray-500">သင်၏အေးဂျင့်များ</p>
              {/* <p className="text-xl font-bold">{totalAgents}</p> */}
              {currentAgent && (
                <p className=" text-gray-500">
                  {agentCounts[currentAgent.agid] || 0}
                </p>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center space-x-4">
            <div className="text-4xl">👥</div>
            <div>
              <p className="text-gray-500">သင်၏ကစားသမားများ</p>
              {/* <p className="text-xl font-bold">{totalUsers}</p> */}
              {currentAgent && (
                <p className="text-xs text-gray-500">
                  {userCounts[currentAgent.agid] || 0}
                </p>
              )}
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center space-x-4">
            <div className="text-4xl">📈</div>
            <div>
              <p className="text-gray-500">အရောင်းရမှတ်</p>
              <p className="text-xl font-bold">
                {agentOfTheMonth ? `${agentOfTheMonth.score}%` : "N/A"}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center space-x-4">
            <div className="text-4xl">💰</div>
            <div>
              <p className="text-gray-500">သင်၏ယူနစ်ပမာဏ</p>
              <p className="text-xl font-bold">
                {currentAgent
                  ? `MMK ${formatBalance(currentAgent.balance)}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sales Score Chart */}
          <div className="md:col-span-2 bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">
              Sales Score Chart အရောင်းရမှတ်ပြဘုတ်
            </h3>
            <Line data={salesChartData} options={salesChartOptions} />
          </div>

          {/* Agent of the Month */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">
              တစ်လတာအကောင်းဆုံးအေးဂျင့်
            </h3>
            {agentOfTheMonth ? (
              <div className="flex items-center space-x-4 p-4 rounded-lg shadow-md bg-gradient-to-r from-blue-100 via-white to-blue-50">
                <img
                  src="https://via.placeholder.com/80"
                  alt={agentOfTheMonth.agentname}
                  className="w-16 h-16 rounded-full border-2 border-blue-500"
                />
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {agentOfTheMonth.agentname}
                  </p>
                  <p className="text-sm text-gray-500">
                    အေးဂျင့်အိုင်ဒီ: {agentOfTheMonth.agid}
                  </p>
                  <p className="text-sm text-gray-700">
                    {agentOfTheMonth.badge}
                  </p>
                </div>
                <div className="ml-auto text-center">
                  <p className="text-xs text-gray-500">ရမှတ်</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {agentOfTheMonth.score}%
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">အေးဂျင့်အချက်အလက်မရှိသေးပါ။</p>
            )}
          </div>
        </div>

        {/* Current Agent Info Section */}
        {/* {currentAgent && (
          <div className="bg-white p-6 rounded shadow mt-6">
            <h3 className="text-lg font-bold mb-4">Your Agent Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Agent ID:</span>{" "}
                  {currentAgent.agid}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Name:</span>{" "}
                  {currentAgent.agentname}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Status:</span>{" "}
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${
                      currentAgent.active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentAgent.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-gray-700">
                  <span className="font-semibold">Your Balance:</span> MMK{" "}
                  {formatBalance(currentAgent.balance)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Downline Balance:</span> MMK{" "}
                  {formatBalance(currentAgent.dbalance)}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">Registered:</span>{" "}
                  {new Date(currentAgent.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )} */}

        {/* Announcements Section */}
        <div className="bg-white p-6 rounded shadow mt-6">
          <h3 className="text-lg font-bold mb-4">
            အေးဂျင့်များအတွက် ကြော်ငြာချက်
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Meeting scheduled for 12th Dec at 10 AM.</li>
            <li>Submit your monthly report by 25th Nov.</li>
            <li>Holiday notice: Office closed on 1st Jan.</li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
