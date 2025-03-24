import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AgentRegister = ({ isOpen, onClose, onAgentAdded }) => {
  const [values, setValues] = useState({
    agid: "",
    agentname: "",
    telephone: "",
    agentreferral: "",
    balance: "",
    dbalance: "",
    arole: "Agent",
    active: 1,
    password: "",
    score: "",
    maxScore: "",
    description: "",
    status: "Active",
    allPT: "85",
    gamesPT: {
      casino: "85",
      fishing: "85",
      slot: "85",
    },
  });

  const [agentBalance, setAgentBalance] = useState(null);
  const [loggedInAgent, setLoggedInAgent] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgentData = async () => {
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
          setAgentBalance(response.data.agent.balance);
          setLoggedInAgent(response.data.agent.agid);

          // Set agentreferral to the logged-in agent ID
          setValues((prevValues) => ({
            ...prevValues,
            agentreferral: response.data.agent.agid,
          }));
        }
      } catch (error) {
        console.error("Error fetching agent balance:", error);
      }
    };

    fetchAgentData();
  }, []);

  const generateRandomAGID = () =>
    `AB${Math.floor(100000 + Math.random() * 900000)}`;

  const checkAGIDUniqueness = async (agid) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/check-agid/${agid}`
      );
      return response.data.isUnique;
    } catch (error) {
      console.error("Error checking AGID uniqueness:", error);
      return false;
    }
  };

  const handleGenerateAGID = async () => {
    let uniqueAGIDFound = false;
    let newAGID = "";

    while (!uniqueAGIDFound) {
      newAGID = generateRandomAGID();
      uniqueAGIDFound = await checkAGIDUniqueness(newAGID);
    }

    setValues((prevValues) => ({ ...prevValues, agid: newAGID }));
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;

    // Handle All PT%
    if (name === "allPT") {
      setValues((prevValues) => ({
        ...prevValues,
        allPT: value,
        gamesPT: {
          casino: value,
          fishing: value,
          slot: value,
        },
      }));
    }
    // Handle individual game PTs
    else if (name.startsWith("gamesPT")) {
      const gameKey = name.split(".")[1];
      setValues((prevValues) => ({
        ...prevValues,
        gamesPT: { ...prevValues.gamesPT, [gameKey]: value },
      }));
    } else {
      setValues({ ...values, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/register`,
        values
      );

      if (response.status === 201) {
        const newAgent = values;
        onAgentAdded(newAgent);
        alert("Agent registered successfully!");
        onClose();
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert(err.response.data.message || "Agent ID or name already exists");
      } else {
        console.error("Error during registration:", err);
        alert("An error occurred. Please try again.");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-4xl p-8 relative overflow-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-center">Add Agent</h2>
        {/* Display Logged-in Agent Balance */}
        {agentBalance !== null && (
          <div className="mb-4">
            <label className="inline text-gray-700 font-semibold mb-2">
              Current Agent Balance
            </label>
            <span className="text-green-600 pl-10">{agentBalance}</span>
          </div>
        )}
        <form
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
          onSubmit={handleSubmit}
        >
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Agent ID
            </label>
            <input
              type="text"
              name="agid"
              value={values.agid}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleGenerateAGID}
              className="mt-2 w-full bg-blue-500 text-white py-1"
            >
              Generate Agent ID
            </button>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Agent Name
            </label>
            <input
              type="text"
              name="agentname"
              value={values.agentname}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Tel
            </label>
            <input
              type="text"
              name="telephone"
              value={values.telephone}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Downline Amount
            </label>
            <input
              type="text"
              name="balance"
              value={values.balance}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Referral Agent
            </label>
            <input
              type="text"
              name="agentreferral"
              value={values.agentreferral}
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Role
            </label>
            <input
              type="text"
              name="arole"
              value={values.arole} // "Agent" is hardcoded here
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={values.password}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Status
            </label>
            <input
              type="text"
              name="status"
              value={values.active == 1 ? "Active" : "Inactive"} // "Agent" is hardcoded here
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              All PT%
            </label>
            <select
              name="allPT"
              value={values.allPT}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 14 }, (_, i) => 85 + i).map((value) => (
                <option key={value} value={value}>
                  {value}%
                </option>
              ))}
            </select>
          </div>

          {/* Games PT Section */}
          <div className="col-span-1 sm:col-span-2">
            <h3 className="text-lg font-bold mb-4">Games PT</h3>
            {["casino", "fishing", "slot"].map((game) => (
              <div key={game} className="mb-4">
                <label className="block text-gray-700 font-semibold mb-2 capitalize">
                  {game} PT
                </label>
                <select
                  name={`gamesPT.${game}`}
                  value={values.gamesPT[game]}
                  onChange={handleChanges}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Array.from({ length: 14 }, (_, i) => 85 + i).map((value) => (
                    <option key={value} value={value}>
                      {value}%
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <button className="w-full bg-green-600 text-white py-2 col-span-1 sm:col-span-2">
            Submit
          </button>
        </form>
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentRegister;
