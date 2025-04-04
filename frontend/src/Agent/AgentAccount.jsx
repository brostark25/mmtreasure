import React, { useState, useEffect } from "react";
import axios from "axios";
import AgentTable from "./AgentTable";
import UserTable from "./UserTable";
import BalanceModal from "./BalanceModal";
import SettingsModal from "./SettingModal";
import AgentRegister from "./AgentReg";
import PlayerRegister from "./PlayerRegister";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faLock,
  faCopy,
  faKey,
  faCog,
  faMinus,
} from "@fortawesome/free-solid-svg-icons";
import UpdatePasswordModal from "./UpdatePasswordModal";
import EditActiveStatusModal from "./EditActiveStatus";

const AgentAccount = () => {
  const [isUpdatePasswordModalOpen, setIsUpdatePasswordModalOpen] =
    useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [isAllUserModalOpen, setIsAllUserModalOpen] = useState(false);
  const [isAllAgentModalOpen, setIsAllAgentModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isWithBalanceModalOpen, setIsWithBalanceModalOpen] = useState(false);
  const [isAgBalanceModalOpen, setAgIsBalanceModalOpen] = useState(false);
  const [isAgIsWithBalanceModalOpen, setAgIsWithBalanceModalOpen] =
    useState(false);
  const [latestUsers, setLatestUsers] = useState([]);
  const [latestAgents, setLatestAgents] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agentId, setAgentId] = useState(null);
  const [agentBalance, setAgentBalance] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amountToWithdraw, setAmountToWithdraw] = useState("");
  const [amountToDistribute, setAmountToDistribute] = useState("");
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [providerFields, setProviderFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [isEditActiveStatusModalOpen, setIsEditActiveStatusModalOpen] =
    useState(false);
  const [isReferralAgent, setIsReferralAgent] = useState(false); // Add this state
  const [agentCount, setAgentCount] = useState(0); //Add state for agent count
  const [userCount, setUserCount] = useState(0); //Add state for user count
  const [selectedAgentDetails, setSelectedAgentDetails] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Fetch logged-in agent data to get agent ID
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
        const agentData = response.data.agent;
        const agentCountResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/agent_count`
        );
        const userCountResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/user_count`
        );
        setAgentId(agentData.agid);
        setAgentBalance(agentData.balance);
        setIsReferralAgent(agentData.isReferralAgent);

        //Set the counts fro agents and users
        setAgentCount(agentCountResponse.data);
        setUserCount(userCountResponse.data);
      }
    } catch (error) {
      console.error("Error fetching agent data:", error);
    }
  };

  // Fetch Agent data and exclude the logged-in agent
  const fetchAgent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/admin/agents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        const filteredAgents = response.data.agents.filter(
          (agent) => agent.agentreferral === agentId
        );

        setLatestAgents(filteredAgents.slice(0, 3));
        setAllAgents(filteredAgents);
      }
    } catch (error) {
      alert("အေးဂျင့်အချက်အလက်များရယူခြင်းမအောင်မြင်၍ထပ်မံကြိုးစားပေးပါ။");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        //Filter users where agentreferral mathces the logged-in agent's agid
        const filteredUsers = response.data.users.filter(
          (user) => user.agentreferral === agentId
        );
        // setLatestUsers(response.data.users.slice(0, 3));
        setLatestUsers(filteredUsers.slice(0, 3));
        setAllUsers(filteredUsers);
      }
    } catch (error) {
      alert("ကစားသမားအချက်အလက်များရယူခြင်းမအောင်မြင်၍ထပ်မံကြိုးစားပေးပါ။");
    } finally {
      setIsLoading(false);
    }
  };

  // Callback to handle adding a new user
  const handleAddUser = (newUser) => {
    setLatestUsers((prevUsers) => [newUser, ...prevUsers.slice(0, 2)]);
    setAllUsers((prevUsers) => [newUser, ...prevUsers]);
  };

  // Callback to handle adding a new agent
  const handleAddAgent = (newAgent) => {
    setLatestAgents((prevAgents) => [newAgent, ...prevAgents.slice(0, 2)]);
    setAllAgents((prevAgents) => [newAgent, ...prevAgents]);
  };

  // Handle distribution action
  const handleDistributeBalance = async () => {
    if ((!selectedUser && !selectedAgent) || !amountToDistribute) {
      alert(
        "ကျေးဇူးပြုပြီး လက်ခံမည့် အေးဂျင့်(သို့)ကစားသမားရွေးပြီး လွှဲလိုသည့်ယူနစ်ပမာဏထည့်ပေးပါ။"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const isDistributingToUser = !!selectedUser;
      const endpoint = isDistributingToUser
        ? `${import.meta.env.VITE_API_URL}/admin/distribute`
        : `${import.meta.env.VITE_API_URL}/admin/distributeagent`;

      const payload = isDistributingToUser
        ? {
            agentId: agentId,
            userId: selectedUser.uid,
            amount: amountToDistribute,
            beforeamount: selectedUser.balance,
          }
        : {
            recipientAgentId: selectedAgent.agid,
            agentId: agentId,
            amount: amountToDistribute,
            beforeamount: selectedAgent.balance,
          };

      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert("ယူနစ်ဖြည့်ခြင်းအောင်မြင်ပါသည်");
        setIsBalanceModalOpen(false);
        setAgIsBalanceModalOpen(false);
      } else {
        alert("ယူနစ်ဖြည့်ခြင်းမအောင်မြင်ပါသဖြင့်ထပ်မံကြိုးစားပေးပါ။");
      }
    } catch (error) {
      alert("An error occurred while distributing balance.");
    }
  };

  const handleWithdrawBalance = async () => {
    if (!selectedUser && !selectedAgent) {
      alert("ကျေးဇူးပြုပြီး ယူနစ်ထုတ်မည့် ကစားသမား(သို့)အေးဂျင့်ရွေးပေးပါ။");
      return;
    }

    if (!amountToWithdraw || isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
      alert("ကျေးဇူးပြု၍ ထုတ်ယူလိုသည့် မှန်ကန်သောယူနစ်ပမာဏထည့်သွင်းပေးပါ။");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const isWithdrawFromUser = !!selectedUser;
      const endpoint = isWithdrawFromUser
        ? `${import.meta.env.VITE_API_URL}/admin/withdraw`
        : `${import.meta.env.VITE_API_URL}/admin/withdrawagent`;

      const payload = isWithdrawFromUser
        ? {
            loggedInAgentId: agentId,
            userId: selectedUser?.uid,
            amount: parseFloat(amountToWithdraw) || 0,
            beforeamount: selectedUser?.balance,
          }
        : {
            selectedAgentId: selectedAgent?.agid,
            loggedInAgentId: agentId,
            amount: parseFloat(amountToWithdraw) || 0,
            beforeamount: selectedAgent?.balance,
          };

      const response = await axios.post(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert(
          "ယူနစ်ထုတ်ခြင်း အောင်မြင်ပါသည်၊ ထုတ်ယူလိုက်သော ယူနစ်ပမာဏကို သင်၏ယူနစ်ပမာဏထဲပေါင်းထည့်ပေးပြီးပါပြီ။"
        );
        setIsWithBalanceModalOpen(false);
        setAgIsWithBalanceModalOpen(false);
      } else {
        alert(
          "ယူနစ်ထုတ်ခြင်းမအောင်မြင်ပါသဖြင့် နောက်တစ်ကြိမ်ထပ်မံကြိုးစားပေးပါ။"
        );
      }
    } catch (error) {
      console.error("Withdrawal error:", error.response?.data || error.message);
      alert("An error occurred while processing the withdrawal.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchLoggedInAgent();
        if (agentId) {
          await fetchAgent();
        }
        await fetchUser();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [agentId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const providers = {
    providerA: ["Field 1", "Field 2", "Field 3"],
    providerB: [
      "Max1",
      "Lim1",
      "Lim2",
      "IsSuspended",
      "ComType",
      "Com1",
      "Com2",
      "Com3",
    ],
    providerC: ["Field 6", "Field 7", "Field 8"],
  };

  const handleProviderChange = (provider) => {
    setSelectedProvider(provider);
    setProviderFields(providers[provider] || []);
    setFormData({}); // Reset form data
  };

  // Update formData dynamically
  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  //Function to open the update password modal for user
  const handleUpdateUserPassword = (user) => {
    setSelectedUser(user);
    setSelectedAgent(null);
    setIsUpdatePasswordModalOpen(true);
  };

  //Function to open the update password modal for agent
  const handleUpdateAgentPassword = (agent) => {
    setSelectedAgent(agent);
    setSelectedUser(null);
    setIsUpdatePasswordModalOpen(true);
  };

  //Function to handle the update password action
  const handlePasswordUpdated = () => {
    console.log("Password updated successfully!");
  };

  // Save settings
  const saveSettings = async () => {
    if (selectedProvider === "providerB") {
      try {
        const payload = {
          userName: selectedUser?.uid,
          max1: formData.Max1 || "",
          lim1: formData.Lim1 || "",
          lim2: formData.Lim2 || "",
          isSuspended: formData.IsSuspended || false,
          comType: formData.ComType || "",
          com1: formData.Com1 || "",
          com2: formData.Com2 || "",
          com3: formData.Com3 || "",
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/ibet/sportbook/updatemembersett`,
          payload
        );

        if (response.data.success) {
          alert("Settings updated successfully!");
          setIsSettingsModalOpen(false);
        } else {
          throw new Error(
            response.data.message || "Failed to update settings."
          );
        }
      } catch (error) {
        console.error("Error saving settings:", error);
        alert("Failed to update settings. Please try again.");
      }
    } else {
      alert("Provider-specific settings not implemented.");
    }
  };

  //Function to open the edit active status modal for a user
  const handleEditUserActiveStatus = (user) => {
    setSelectedUser(user);
    setSelectedAgent(null);
    setIsEditActiveStatusModalOpen(true);
  };

  //Function to open the edit active status modal for an agent
  const handleEditAgentActiveStatus = (agent) => {
    setSelectedAgent(agent);
    setSelectedUser(null);
    setIsEditActiveStatusModalOpen(true);
  };

  const handleActiveStatusUpdated = () => {
    console.log("Active status updated successfully!");
  };

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
      alert(
        "အေးဂျင့်အချက်အလက်များရယူခြင်းမအောင်မြင်ပါသဖြင့် နောက်တစ်ကြိမ်ထပ်မံကြိုးစားပေးပါ။"
      );
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <>
      <div className="flex-1 bg-gray-100 p-4 sm:p-6">
        <div className="space-y-6">
          {/* Agent Table */}
          <AgentTable
            agents={latestAgents}
            onAddBalance={(agent) => {
              setSelectedAgent(agent);
              setAgIsBalanceModalOpen(true);
            }}
            onWithdrawBalance={(agent) => {
              setSelectedAgent(agent);
              setAgIsWithBalanceModalOpen(true);
            }}
            onShowAllAgents={() => setIsAllAgentModalOpen(true)}
            onAddAgent={() => setIsAgentModalOpen(true)}
            onUpdatePassword={handleUpdateAgentPassword}
            onEditActiveStatus={handleEditAgentActiveStatus}
            loggedInAgentId={agentId}
            isReferralAgent={isReferralAgent}
            agentCount={agentCount}
            userCount={userCount}
          />

          {/* User Table */}
          <UserTable
            users={latestUsers}
            onAddBalance={(user) => {
              setSelectedUser(user);
              setIsBalanceModalOpen(true);
            }}
            onWithdrawBalance={(user) => {
              setSelectedUser(user);
              setIsWithBalanceModalOpen(true);
            }}
            onShowAllUsers={() => setIsAllUserModalOpen(true)}
            onAddUser={() => setIsPlayerModalOpen(true)}
            onSettings={(user) => {
              setSelectedUser(user);
              setIsSettingsModalOpen(true);
            }}
            onUpdatePassword={handleUpdateUserPassword}
            onEditActiveStatus={handleEditUserActiveStatus}
            loggedInAgentId={agentId}
            isReferralAgent={isReferralAgent}
          />

          {/* Update Password Modal */}
          <UpdatePasswordModal
            isOpen={isUpdatePasswordModalOpen}
            onClose={() => setIsUpdatePasswordModalOpen(false)}
            selectedUser={selectedUser}
            selectedAgent={selectedAgent}
            onPasswordUpdated={handlePasswordUpdated}
          />

          {/* Edit Active Status Modal */}
          <EditActiveStatusModal
            isOpen={isEditActiveStatusModalOpen}
            onClose={() => setIsEditActiveStatusModalOpen(false)}
            selectedUser={selectedUser}
            selectedAgent={selectedAgent}
            onStatusUpdated={handleActiveStatusUpdated}
          />
        </div>
      </div>

      {/* Balance Distribution Modal for Users */}
      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        title="ယူနစ်ထည့်သွင်းရန်"
        fromLabel="အေးဂျင့်အိုင်ဒီမှ"
        fromValue={agentId}
        valuefromLable="အေးဂျင့်ယူနစ်ပမာဏ"
        valuefrom={agentBalance}
        toLabel="ကစားသမားအိုင်ဒီဆီသို့"
        toValue={selectedUser?.uid}
        valuetoLable="ကစားသမားယူနစ်ပမာဏ"
        valueto={selectedUser?.balance}
        amount={amountToDistribute}
        onAmountChange={setAmountToDistribute}
        onSubmit={handleDistributeBalance}
      />

      {/* Balance Distribution Modal for Agents */}
      <BalanceModal
        isOpen={isAgBalanceModalOpen}
        onClose={() => setAgIsBalanceModalOpen(false)}
        title="ယူနစ်ထည့်သွင်းရန်"
        fromLabel="အေးဂျင့်အိုင်ဒီမှ"
        fromValue={agentId}
        valuefromLable="အေးဂျင့်ယူနစ်ပမာဏမှ"
        valuefrom={agentBalance}
        toLabel="အေးဂျင့်အိုင်ဒီဆီသို့"
        toValue={selectedAgent?.agid}
        valuetoLable="အေးဂျင့်ယူနစ်ပမာဏသို့"
        valueto={selectedAgent?.balance}
        amount={amountToDistribute}
        onAmountChange={setAmountToDistribute}
        onSubmit={handleDistributeBalance}
      />

      {/* Balance Withdraw Modal for Users */}
      <BalanceModal
        isOpen={isWithBalanceModalOpen}
        onClose={() => setIsWithBalanceModalOpen(false)}
        title="ယူနစ်ထုတ်ရန်"
        fromLabel="ကစားသမားအိုင်ဒီမှ"
        fromValue={selectedUser?.uid}
        valuefromLable="ကစားသမားယူနစ်ပမာဏ"
        valuefrom={selectedUser?.balance}
        toLabel="အေးဂျင့်အိုင်ဒီသို့"
        toValue={agentId}
        valuetoLable="အေးဂျင့်ယူနစ်ပမာဏ"
        valueto={agentBalance}
        amount={amountToWithdraw}
        onAmountChange={setAmountToWithdraw}
        onSubmit={handleWithdrawBalance}
      />

      {/* Balance Withdraw Modal for Agents */}
      <BalanceModal
        isOpen={isAgIsWithBalanceModalOpen}
        onClose={() => setAgIsWithBalanceModalOpen(false)}
        title="ယူနစ်ထုတ်ရန်"
        fromLabel="အေးဂျင့်အိုင်ဒီမှ"
        fromValue={selectedAgent?.agid}
        valuefromLable="အေးဂျင့်ယူနစ်ပမာဏမှ"
        valuefrom={selectedAgent?.balance}
        toLabel="အေးဂျင့်အိုင်ဒီသို့"
        toValue={agentId}
        valuetoLable="အေးဂျင့်ယူနစ်ပမာဏသို့"
        valueto={agentBalance}
        amount={amountToWithdraw}
        onAmountChange={setAmountToWithdraw}
        onSubmit={handleWithdrawBalance}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={selectedUser}
        selectedProvider={selectedProvider}
        providerFields={providerFields}
        formData={formData}
        onProviderChange={handleProviderChange}
        onInputChange={handleInputChange}
        onSave={saveSettings}
      />

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

      {/* All Agents Modal */}
      {isAllAgentModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          style={{ zIndex: 900 }}
        >
          <div
            className="bg-white rounded-md p-4 sm:p-6 max-w-full sm:max-w-4xl w-full overflow-hidden"
            style={{
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal content */}
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
              အေးဂျင့်များ
            </h2>
            <div
              className="overflow-auto flex-1"
              style={{ maxHeight: "calc(90vh - 100px)" }}
            >
              <table className="w-full text-left border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">အေးဂျင့်အိုင်ဒီ</th>
                    <th className="border p-2">အမည်</th>
                    <th className="border p-2">အေးဂျင့်ယူနစ်ပမာဏ</th>
                    <th className="border p-2">Downline ယူနစ်ပမာဏ</th>
                    <th className="border p-2">လုပ်ဆောင်ချက်များ</th>
                    <th className="border p-2">အခြေအနေ</th>
                    <th className="border p-2">
                      နောက်ဆုံးဝင်သည့်အချိန်/အကောင့်စတင်ဖွင့်သည့်နေ့
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allAgents.map((agent) => (
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
                          <button
                            className="text-blue-500"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setAgIsBalanceModalOpen(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                          <button
                            className="text-blue-500"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setAgIsWithBalanceModalOpen(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <button
                            className="text-blue-500"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsUpdatePasswordModalOpen(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faKey} />
                          </button>
                          <button className="text-blue-500">
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                          <button
                            className="text-blue-500"
                            onClick={() => {
                              setSelectedAgent(agent);
                              setIsEditActiveStatusModalOpen(true);
                            }}
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

              {/* Display created agents and users for the selected agent */}
              {selectedAgentDetails && (
                <div className="mt-6">
                  <h3 className="text-lg font-bold mb-4">
                    ပြုလုပ်ပေးခဲ့သည့် အေးဂျင့်နှင့်ကစားသမားများ
                  </h3>
                  {isLoadingDetails ? (
                    <div>Loading...</div>
                  ) : (
                    <>
                      <h4 className="text-md font-semibold mb-2">
                        ပြုလုပ်ပေးခဲ့သည့်အေးဂျင့်များ
                      </h4>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border p-2">အေးဂျင့်အိုင်ဒီ</th>
                            <th className="border p-2">အေးဂျင့်ယူနစ်ပမာဏ</th>
                            <th className="border p-2">
                              အေးဂျင့် Downline ယူနစ်ပမာဏ
                            </th>
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

                      <h4 className="text-md font-semibold mt-4 mb-2">
                        ပြုလုပ်ပေးခဲ့သည့် ကစားသမားများ
                      </h4>
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-200">
                            <th className="border p-2">ကစားသမားအိုင်ဒီ</th>
                            <th className="border p-2">ကစားသမားယူနစ်ပမာဏ</th>
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
            <button
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded-md w-full sm:w-auto"
              onClick={() => setIsAllAgentModalOpen(false)}
            >
              ပိတ်မည်
            </button>
          </div>
        </div>
      )}
      {/* All Users Modal */}
      {isAllUserModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
          style={{ zIndex: 900 }}
        >
          <div
            className="bg-white rounded-md p-4 sm:p-6 max-w-full sm:max-w-4xl w-full overflow-hidden"
            style={{
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal content */}
            <h2 className="text-lg sm:text-xl font-bold mb-4 text-center">
              ကစားသမားများ
            </h2>
            <div
              className="overflow-auto flex-1"
              style={{ maxHeight: "calc(90vh - 100px)" }} // Adjust height dynamically for the content area
            >
              <table className="w-full text-left border-collapse text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">ကစားသမားအိုင်ဒီ</th>
                    <th className="border p-2">အမည်</th>
                    <th className="border p-2">ငွေကြေး</th>
                    <th className="border p-2">ယူနစ်</th>
                    <th className="border p-2">အခြေအနေ</th>
                    <th className="border-p-2">လုပ်ဆောင်ချက်များ</th>
                    <th className="border p-2">စတင်သောအချိန်</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((user) => (
                    <tr key={user.uid}>
                      <td className="border p-2">{user.uid}</td>
                      <td className="border p-2">{user.username}</td>
                      <td className="border p-2">{user.currency}</td>
                      <td className="border p-2">{user.balance}</td>
                      <td className="border p-2">
                        {user.active ? "Active" : "Inactive"}
                      </td>
                      <td className="border p-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // setSelectedAgent(agent);
                              setSelectedUser(user);
                              setIsBalanceModalOpen(true);
                            }}
                            className="text-blue-500"
                          >
                            <FontAwesomeIcon icon={faPlus} />
                          </button>
                          <button
                            onClick={() => {
                              // setSelectedAgent(agent);
                              setSelectedUser(user);
                              setIsWithBalanceModalOpen(true);
                            }}
                            className="text-blue-500"
                          >
                            <FontAwesomeIcon icon={faMinus} />
                          </button>
                          <button
                            className="text-blue-500"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsUpdatePasswordModalOpen(true);
                            }}
                          >
                            <FontAwesomeIcon icon={faKey} />
                          </button>
                          <button className="text-blue-500">
                            <FontAwesomeIcon icon={faCopy} />
                          </button>
                          <button
                            className="text-blue-500"
                            onClick={() => {
                              setSelectedUser(user);
                              handleEditUserActiveStatus(user);
                            }}
                          >
                            <FontAwesomeIcon icon={faLock} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsSettingsModalOpen(true);
                            }}
                            className="text-blue-500"
                          >
                            <FontAwesomeIcon icon={faCog} />
                          </button>
                        </div>
                      </td>
                      <td className="border p-2">{user.createdate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 mt-4 rounded-md w-full sm:w-auto"
              onClick={() => setIsAllUserModalOpen(false)}
            >
              ပိတ်မည်
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentAccount;
