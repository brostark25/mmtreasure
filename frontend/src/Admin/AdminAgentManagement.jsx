import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUserX,
  FiUserCheck,
  FiCreditCard,
  FiRefreshCw,
  FiLoader,
  FiKey,
} from "react-icons/fi";
import { toast } from "react-toastify";
import AgentRegister from "../Agent/AgentReg";
import BalanceModal from "../Agent/BalanceModal";
import UpdatePasswordModal from "../Agent/UpdatePasswordModal";

const AdminAgentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [agentCounts, setAgentCounts] = useState({});
  const [userCounts, setUserCounts] = useState({});
  const [agentId, setAgentId] = useState(null);
  const [agentBalance, setAgentBalance] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [amountToDistribute, setAmountToDistribute] = useState("");

  // Format number with commas and 2 decimal places
  const formatBalance = (value) => {
    if (value === undefined || value === null) return "0.00";
    const num = parseFloat(value);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchLoggedInAdmin = async () => {
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
        setAgentId(response.data.agent.agid);
        setAgentBalance(response.data.agent.balance || 0);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
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

      setAgents(agentsResponse.data.agents);
      setAgentCounts(countsResponse.data);
      setUserCounts(userCountsResponse.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching agents:", error);
      alert("အေးဂျင့်အချက်အလက်များရယူခြင်းမအောင်မြင်ပါ။");
      setLoading(false);
    }
  };

  const handleAddAgent = (newAgent) => {
    setAgents((prevAgents) => [newAgent, ...prevAgents]);
    fetchAgents();
  };

  useEffect(() => {
    fetchLoggedInAdmin();
    fetchAgents();
  }, []);

  const toggleStatus = async (agent) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = agent.active ? 0 : 1;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/update_agent_active_status`,
        { agid: agent.agid, active: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAgents(
        agents.map((a) =>
          a.agid === agent.agid ? { ...a, active: newStatus } : a
        )
      );
      alert(`Agent ${newStatus ? "activated" : "deactivated"} successfully`);
    } catch (error) {
      console.error("Error updating agent status:", error);
      alert("အေးဂျင့်အခြေအနေပြောင်းလဲခြင်းမအောင်မြင်ပါ။");
    }
  };

  const handleDistributeBalance = async () => {
    if (!selectedAgent || !amountToDistribute) {
      alert(
        "ကျေးဇူးပြုပြီးယူနစ်ထည့်လိုသောအေးဂျင့်ရွေးပေး၍ ယူနစ်ပမာဏထည့်သွင်းပေးပါ။"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distributeagent`,
        {
          recipientAgentId: selectedAgent.agid,
          agentId: agentId,
          amount: amountToDistribute,
          beforeamount: selectedAgent.balance,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchAgents();
      setIsBalanceModalOpen(false);
      alert("ယူနစ်ဖြည့်သွင်းခြင်းအောင်မြင်ပါသည်။");
    } catch (error) {
      console.error("Error distributing balance:", error);
      alert("ယူနစ်ဖြည့်သွင်းခြင်းမအောင်မြင်ပါသဖြင့် ထပ်မံကြိုးစားပေးပါ။");
    }
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.agentname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.agid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">
          အေးဂျင့်အချက်အလက်များစီမံခန့်ခွဲခြင်း
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={fetchAgents}
            className="bg-gray-200 text-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base hover:bg-gray-300"
          >
            <FiRefreshCw className="mr-1 sm:mr-2" /> Refresh
          </button>
          <button
            onClick={() => {
              setCurrentAgent(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base hover:bg-indigo-700"
          >
            <FiPlus className="mr-1 sm:mr-2" /> အေးဂျင့်အသစ်ထည့်ရန်
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Agents Table */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <FiLoader className="animate-spin text-4xl text-indigo-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    အေးဂျင့်အိုင်ဒီ
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    အမည်
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ယူနစ်ပမာဏ
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Downline ယူနစ်
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    အခြေအနေ
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    စတင်သောနေ့
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    လုပ်ဆောင်ချက်များ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((agent) => (
                    <tr key={agent.agid}>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>{agent.agid}</span>
                          <span className="text-xs text-gray-500">
                            A: {agentCounts[agent.agid] || 0} | P:{" "}
                            {userCounts[agent.agid] || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                        {agent.agentname}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        MMK {formatBalance(agent.balance)}
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        MMK {formatBalance(agent.dbalance)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              agent.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {agent.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(agent.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsBalanceModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="ယူနစ်ဖြည့်ရန်"
                          >
                            <FiCreditCard size={16} />
                          </button>
                          <button
                            onClick={() => toggleStatus(agent)}
                            className={`p-1 rounded ${
                              agent.active
                                ? "text-red-500 hover:bg-red-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                            title={agent.active ? "Deactivate" : "Activate"}
                          >
                            {agent.active ? (
                              <FiUserX size={16} />
                            ) : (
                              <FiUserCheck size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setCurrentAgent(agent);
                              setIsModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="ပြင်ဆင်ရန်"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentAgent(agent);
                              setIsPasswordModalOpen(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="ပါ့စ်ဝေါ့ပြောင်းရန်"
                          >
                            <FiKey size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      သင်ရှာသော အေးဂျင့်မရှိသေးပါ။
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Update the AgentRegister component call */}
      <AgentRegister
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAgentAdded={handleAddAgent}
        agent={currentAgent}
        onSave={fetchAgents}
        onUpdate={fetchAgents} // Add this prop
      />

      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        title="Distribute Balance"
        fromLabel="From Admin"
        fromValue={agentId}
        valuefromLable="Admin Balance"
        valuefrom={formatBalance(agentBalance)}
        toLabel="To Agent ID"
        toValue={selectedAgent?.agid}
        valuetoLable="Agent Balance"
        valueto={formatBalance(selectedAgent?.balance)}
        amount={amountToDistribute}
        onAmountChange={setAmountToDistribute}
        onSubmit={handleDistributeBalance}
      />

      {/* Update Password Modal */}
      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        selectedAgent={currentAgent}
        // onSubmit={handleUpdatePassword}
      />
    </div>
  );
};

export default AdminAgentManagement;
