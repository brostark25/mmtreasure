import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUserX,
  FiUserCheck,
  FiRefreshCw,
  FiLoader,
  FiKey,
  FiMinus,
  FiCreditCard,
} from "react-icons/fi";
import { toast } from "react-toastify";
import BalanceModal from "../Agent/BalanceModal";
import PlayerRegister from "../Agent/PlayerRegister";
import UpdatePasswordModal from "../Agent/UpdatePasswordModal";

const AdminUserManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userCounts, setUserCounts] = useState({});

  // Balance management states
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isWithBalanceModalOpen, setIsWithBalanceModalOpen] = useState(false);
  const [amountToDistribute, setAmountToDistribute] = useState("");
  const [amountToWithdraw, setAmountToWithdraw] = useState("");
  const [adminId, setAdminId] = useState(null);
  const [adminBalance, setAdminBalance] = useState(0);

  // Format number with commas and 2 decimal places
  const formatBalance = (value) => {
    if (value === undefined || value === null) return "0.00";
    const num = parseFloat(value);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // First, fetch users and counts which are essential
      const [usersResponse, countsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/user/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/user/user_count`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setUsers(usersResponse.data.users);
      setUserCounts(countsResponse.data);

      // Then try to fetch admin balance separately (as it might not be available)
      try {
        const adminResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/agent_dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setAdminId(adminResponse.data.agent.agid);
        setAdminBalance(adminResponse.data.agent.balance || 0);
      } catch (adminError) {
        console.warn("Admin dashboard not available, using default balance");
        setAdminBalance(0); // Default value if admin endpoint not available
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("ကစားသမားအချက်အလက်များရယူခြင်းမအောင်မြင်ပါ။");
      setLoading(false);
    }
  };

  const handleAddUser = (newUser) => {
    setUsers((prevUsers) => [newUser, ...prevUsers]);
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = user.active ? 0 : 1;

      await axios.put(
        `${import.meta.env.VITE_API_URL}/user/update_user_active_status`,
        { userId: user.uid, active: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers(
        users.map((u) => (u.uid === user.uid ? { ...u, active: newStatus } : u))
      );
      toast.success(
        `User ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      alert("ကစားသမားအခြေအနေပြောင်းလဲခြင်းမအောင်မြင်ပါ။");
    }
  };

  // const deleteUser = async (userId) => {
  //   if (!window.confirm("Are you sure you want to delete this user?")) return;

  //   try {
  //     const token = localStorage.getItem("token");
  //     await axios.delete(
  //       `${import.meta.env.VITE_API_URL}/user/users/${userId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     setUsers(users.filter((user) => user.uid !== userId));
  //     toast.success("User deleted successfully");
  //   } catch (error) {
  //     console.error("Error deleting user:", error);
  //     toast.error("Failed to delete user");
  //   }
  // };

  // Handle distribution action
  const handleDistributeBalance = async () => {
    if (!currentUser || !amountToDistribute) {
      alert(
        "ကျေးဇူးပြုပြီးယူနစ်ထည့်လိုသောကစားသမားရွေးပေး၍ ယူနစ်ပမာဏထည့်သွင်းပေးပါ။"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/distribute`,
        {
          agentId: adminId, // Using "admin" as the agent ID for admin distribution
          userId: currentUser.uid,
          amount: amountToDistribute,
          beforeamount: currentUser.balance,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert("ယူနစ်ဖြည့်သွင်းခြင်းအောင်မြင်ပါသည်။");
        setIsBalanceModalOpen(false);
        fetchUsers(); // Refresh user data
      } else {
        alert("ယူနစ်ဖြည့်သွင်းခြင်းမအောင်မြင်ပါသဖြင့် ထပ်မံကြိုးစားပေးပါ။");
      }
    } catch (error) {
      console.error("Distribution error:", error);
      alert("ယူနစ်ဖြည့်သွင်းရန်အခက်အခဲဖြစ်နေပါသည်။");
    }
  };

  const handleWithdrawBalance = async () => {
    if (!currentUser) {
      toast.error("Please select a user to withdraw from.");
      return;
    }

    if (!amountToWithdraw || isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/withdraw`,
        {
          loggedInAgentId: "admin", // Using "admin" as the agent ID for admin withdrawal
          userId: currentUser.uid,
          amount: parseFloat(amountToWithdraw) || 0,
          beforeamount: currentUser.balance,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        toast.success(
          "Withdrawal successful! The amount has been added to admin balance."
        );
        setIsWithBalanceModalOpen(false);
        fetchUsers(); // Refresh user data
      } else {
        toast.error("Failed to withdraw balance. Please try again.");
      }
    } catch (error) {
      console.error("Withdrawal error:", error.response?.data || error.message);
      toast.error("An error occurred while processing the withdrawal.");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
        <h2 className="text-xl sm:text-2xl font-bold">
          ကစားသမားအချက်အလက်များစီမံခန့်ခွဲခြင်း
        </h2>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button
            onClick={fetchUsers}
            className="bg-gray-200 text-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base hover:bg-gray-300"
          >
            <FiRefreshCw className="mr-1 sm:mr-2" /> Refresh
          </button>
          <button
            onClick={() => {
              setCurrentUser(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base hover:bg-indigo-700"
          >
            <FiPlus className="mr-1 sm:mr-2" /> ကစားသမားအသစ်ထည့်ရန်
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
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
                    ကစားသမားအိုင်ဒီ
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    အမည်
                  </th>
                  <th className="px-3 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ယူနစ်ပမာဏ
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.uid}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        MMK {formatBalance(user.balance)}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${
                              user.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                        >
                          {user.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdate).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-2 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          <button
                            onClick={() => {
                              setCurrentUser(user);
                              setIsBalanceModalOpen(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="ယူနစ်ဖြည့်ရန်"
                          >
                            <FiCreditCard size={16} />
                          </button>
                          {/* <button
                            onClick={() => {
                              setCurrentUser(user);
                              setIsWithBalanceModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Withdraw Balance"
                          >
                            <FiMinus size={16} />
                          </button> */}
                          <button
                            onClick={() => toggleStatus(user)}
                            className={`p-1 rounded ${
                              user.active
                                ? "text-red-500 hover:bg-red-50"
                                : "text-green-500 hover:bg-green-50"
                            }`}
                            title={user.active ? "Deactivate" : "Activate"}
                          >
                            {user.active ? (
                              <FiUserX size={16} />
                            ) : (
                              <FiUserCheck size={16} />
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setCurrentUser(user);
                              setIsModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="ပြင်ဆင်ရန်"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentUser(user);
                              setIsPasswordModalOpen(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                            title="ပါ့စ်ဝေါ့ပြောင်းရန်"
                          >
                            <FiKey size={16} />
                          </button>
                          {/* <button
                            onClick={() => deleteUser(user.uid)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      သင်ရှာသော ကစားသမားမရှိသေးပါ။
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <PlayerRegister
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentUser(null);
        }}
        onUserAdded={handleAddUser}
        user={currentUser}
        onSave={fetchUsers}
        onUpdate={fetchUsers}
      />

      {/* Balance Distribution Modal */}
      <BalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        title="Distribute Balance"
        fromLabel="From Admin"
        fromValue="admin"
        valuefromLable="Admin Balance"
        valuefrom={adminBalance}
        toLabel="To User ID"
        toValue={currentUser?.uid}
        valuetoLable="User Balance"
        valueto={currentUser?.balance}
        amount={amountToDistribute}
        onAmountChange={setAmountToDistribute}
        onSubmit={handleDistributeBalance}
      />

      {/* Balance Withdraw Modal */}
      <BalanceModal
        isOpen={isWithBalanceModalOpen}
        onClose={() => setIsWithBalanceModalOpen(false)}
        title="Withdraw Balance"
        fromLabel="From User ID"
        fromValue={currentUser?.uid}
        valuefromLable="User Balance"
        valuefrom={currentUser?.balance}
        toLabel="To Admin"
        toValue="admin"
        valuetoLable="Admin Balance"
        valueto={adminBalance}
        amount={amountToWithdraw}
        onAmountChange={setAmountToWithdraw}
        onSubmit={handleWithdrawBalance}
      />

      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        selectedUser={currentUser}
      />
    </div>
  );
};

export default AdminUserManagement;
