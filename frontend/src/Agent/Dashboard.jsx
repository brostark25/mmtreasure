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
  const [totalUsers, setTotalUsers] = useState(0); // Add state for total users

  const fetchAgents = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage

      // Fetch agents
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

      // Calculate "Agent of the Month" based on score
      const topAgent = fetchedAgents.reduce((prev, current) =>
        prev.score > current.score ? prev : current
      );
      setAgentOfTheMonth(topAgent);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
      // Fetch total users
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
      console.error("Error fetching data:", error);
    }
  };

  // Fetch agent data
  useEffect(() => {
    fetchAgents();
    fetchUsers();
  }, []);

  // Chart data for Sales Score
  const salesChartData = {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [
      {
        label: "Sales Score (%)",
        data: agents.map((agent) => agent.score), // Assuming sales scores are provided for agents
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
              <p className="text-gray-500">Total Agents</p>
              <p className="text-xl font-bold">{totalAgents}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center space-x-4">
            <div className="text-4xl">👥</div>
            <div>
              <p className="text-gray-500">Total Users</p>
              <p className="text-xl font-bold">{totalUsers}</p>{" "}
              {/* Display total users */}
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center space-x-4">
            <div className="text-4xl">📈</div>
            <div>
              <p className="text-gray-500">Sales Score</p>
              <p className="text-xl font-bold">98%</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded shadow flex items-center space-x-4">
            <div className="text-4xl">💰</div>
            <div>
              <p className="text-gray-500">Revenue</p>
              <p className="text-xl font-bold">$15,400</p>
            </div>
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sales Score Chart */}
          <div className="md:col-span-2 bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">Sales Score Chart</h3>
            <Line data={salesChartData} options={salesChartOptions} />
          </div>

          {/* Agent of the Month */}
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">Agent of the Month</h3>
            {agentOfTheMonth && (
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
                    Agent ID: {agentOfTheMonth.agid}
                  </p>
                  <p className="text-sm text-gray-700">
                    {agentOfTheMonth.badge}
                  </p>
                </div>
                <div className="ml-auto text-center">
                  <p className="text-xs text-gray-500">Score</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {agentOfTheMonth.score}%
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Section */}
        <div className="bg-white p-6 rounded shadow mt-6">
          <h3 className="text-lg font-bold mb-4">Announcements for Agents</h3>
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
