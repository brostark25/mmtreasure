import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AgentRegister = ({
  isOpen,
  onClose,
  onAgentAdded,
  agent,
  onSave,
  onUpdate,
}) => {
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
  const [isEditMode, setIsEditMode] = useState(false);

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

  // Set form values when agent prop changes (edit mode)
  useEffect(() => {
    if (agent) {
      setIsEditMode(true);
      setValues({
        agid: agent.agid,
        agentname: agent.agentname,
        telephone: agent.telephone,
        agentreferral: agent.agentreferral,
        balance: agent.balance,
        dbalance: agent.dbalance,
        arole: agent.arole,
        active: agent.active,
        password: "", // Don't show password in edit mode
        score: agent.score || "",
        maxScore: agent.maxScore || "",
        description: agent.description || "",
        status: agent.active === 1 ? "Active" : "Inactive",
        allPT: agent.allPT || "85",
        gamesPT: agent.gamesPT
          ? JSON.parse(agent.gamesPT)
          : {
              casino: "85",
              fishing: "85",
              slot: "85",
            },
      });
    } else {
      setIsEditMode(false);
      // Reset to default values
      setValues({
        agid: "",
        agentname: "",
        telephone: "",
        agentreferral: loggedInAgent,
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
    }
  }, [agent, loggedInAgent]);

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
      if (isEditMode) {
        // Update existing agent
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/admin/agents/${values.agid}`,
          {
            agentname: values.agentname,
            telephone: values.telephone,
            active: values.active,
            allPT: values.allPT,
            gamesPT: values.gamesPT,
          }
        );

        if (response.status === 200) {
          alert("Agent အချက်အလက်ပြင်ဆင်မှုအောင်မြင်ပါသည်။");
          onUpdate(); // Refresh the agent list
          onClose();
        }
      } else {
        // Create new agent
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/admin/register`,
          values
        );

        if (response.status === 201) {
          const newAgent = values;
          onAgentAdded(newAgent);
          alert("Agent အသစ်ဖန်တီးမှုအောင်မြင်ပါသည်။");
          onClose();
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert(
          err.response.data.message ||
            "ယခု Agent ID သို့ နာမည်ဖြင့် Account ရှိပြီးသားဖြစ်နေပါတယ်။ တခြားတစ်ခုပြောင်းပေးပါ။"
        );
      } else {
        console.error("Error during registration:", err);
        alert("လုပ်ဆောင်မှုမအောင်မြင်ပါသဖြင့် နောက်တစ်ခေါက်ကြိုးစားပေးပါ။");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-4xl p-8 relative overflow-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEditMode ? "အေးဂျင့်ပြင်ဆင်ရန်" : "အေးဂျင့်အသစ်ထည့်ရန်"}
        </h2>
        {!isEditMode && agentBalance !== null && (
          <div className="mb-4">
            <label className="inline text-gray-700 font-semibold mb-2">
              လက်ရှိ Account ပိုင်ရှင်၏ယူနစ်
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
              အေးဂျင့်အိုင်ဒီ
            </label>
            <input
              type="text"
              name="agid"
              value={values.agid}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={isEditMode}
            />
            {!isEditMode && (
              <button
                type="button"
                onClick={handleGenerateAGID}
                className="mt-2 w-full bg-blue-500 text-white py-1"
              >
                အေးဂျင့်အိုင်ဒီအသစ်ထုတ်ရန်
              </button>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              အေးဂျင့်အမည်
            </label>
            <input
              type="text"
              name="agentname"
              value={values.agentname}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              ဖုန်းနံပါတ်
            </label>
            <input
              type="text"
              name="telephone"
              value={values.telephone}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {!isEditMode && (
            <>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ယခုအေးဂျင့်အသစ်ထဲသို့ထည့်မည့်ယူနစ်ပမာဏ
                </label>
                <input
                  type="text"
                  name="balance"
                  value={values.balance}
                  onChange={handleChanges}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ပက်စ်ဝေါ့
                </label>
                <input
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChanges}
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              ထောက်ခံပေးသောအေးဂျင့်
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
              ရာထူး
            </label>
            <input
              type="text"
              name="arole"
              value={values.arole}
              readOnly
              className="w-full px-4 py-2 border rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              အေးဂျင့်အခြေအနေ
            </label>
            <select
              name="active"
              value={values.active}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              PT ရာခိုင်နှုန်းအားလုံး
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
            {isEditMode ? "အေးဂျင့်ပြင်ဆင်မည်" : "အေးဂျင့်အသစ်ဖန်တီးမည်"}
          </button>
        </form>
        <div className="flex justify-end mt-8 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            ပယ်ဖျက်မည်
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentRegister;
