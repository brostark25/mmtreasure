import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const PlayerRegister = ({
  isOpen,
  onClose,
  onUserAdded,
  user,
  onSave,
  onUpdate,
}) => {
  const [values, setValues] = useState({
    uid: "",
    username: "",
    password: "",
    currency: "MMK",
    balance: "",
    active: 1,
    agentreferral: "",
    status: "Active",
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

  // Set form values when user prop changes (edit mode)
  useEffect(() => {
    if (user) {
      setIsEditMode(true);
      setValues({
        uid: user.uid,
        username: user.username,
        password: "", // Don't show password in edit mode
        currency: user.currency || "MMK",
        balance: user.balance,
        active: user.active,
        agentreferral: user.agentreferral,
        status: user.active === 1 ? "Active" : "Inactive",
      });
    } else {
      setIsEditMode(false);
      // Reset to default values
      setValues({
        uid: "",
        username: "",
        password: "",
        currency: "MMK",
        balance: "",
        active: 1,
        agentreferral: loggedInAgent,
        status: "Active",
      });
    }
  }, [user, loggedInAgent]);

  const generateRandomUID = () =>
    `B${Math.floor(100000 + Math.random() * 900000)}`;

  const checkUIDUniqueness = async (uid) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/check-uid/${uid}`
      );
      return response.data.isUnique;
    } catch (error) {
      console.error("Error checking UID uniqueness:", error);
      return false;
    }
  };

  const handleGenerateUID = async () => {
    let uniqueUIDFound = false;
    let newUID = "";

    while (!uniqueUIDFound) {
      newUID = generateRandomUID();
      uniqueUIDFound = await checkUIDUniqueness(newUID);
    }

    setValues((prevValues) => ({ ...prevValues, uid: newUID }));
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     if (isEditMode) {
  //       // Update existing user
  //       const response = await axios.put(
  //         `${import.meta.env.VITE_API_URL}/user/users/${values.uid}`,
  //         {
  //           username: values.username,
  //           currency: values.currency,
  //           balance: values.balance,
  //           active: values.active,
  //         }
  //       );

  //       if (response.status === 200) {
  //         alert("ကစားသမားအချက်အလက်ပြင်ဆင်မှုအောင်မြင်ပါသည်။");
  //         onUpdate(); // Refresh the user list
  //         onClose();
  //       }
  //     } else {
  //       // Create new user
  //       const response = await axios.post(
  //         `${import.meta.env.VITE_API_URL}/user/register`,
  //         values
  //       );

  //       if (response.status === 201) {
  //         const newUser = values;
  //         onUserAdded(newUser);
  //         alert("ကစားသမားအသစ်ဖန်တီးမှုအောင်မြင်ပါသည်။");
  //         onClose();
  //       }
  //     }
  //   } catch (err) {
  //     if (err.response && err.response.status === 409) {
  //       alert(
  //         err.response.data.message ||
  //           "ယခု User ID သို့ နာမည်ဖြင့် Account ရှိပြီးသားဖြစ်နေပါတယ်။ တခြားတစ်ခုပြောင်းပေးပါ။"
  //       );
  //     } else {
  //       console.error("Error during registration:", err);
  //       alert("လုပ်ဆောင်မှုမအောင်မြင်ပါသဖြင့် နောက်တစ်ခေါက်ကြိုးစားပေးပါ။");
  //     }
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      if (isEditMode) {
        // Update existing user
        const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/user/update/${values.uid}`,
          {
            username: values.username,
            currency: values.currency,
            balance: values.balance,
            active: values.active,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 200) {
          alert("ကစားသမားအချက်အလက်ပြင်ဆင်မှုအောင်မြင်ပါသည်။");
          onUpdate(); // Refresh the user list
          onClose();
        }
      } else {
        // Create new user
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/user/register`,
          values,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.status === 201) {
          onUserAdded(values);
          alert("ကစားသမားအသစ်ဖန်တီးမှုအောင်မြင်ပါသည်။");
          onClose();
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        alert(
          err.response.data.message ||
            "ယခု User ID သို့ နာမည်ဖြင့် Account ရှိပြီးသားဖြစ်နေပါတယ်။ တခြားတစ်ခုပြောင်းပေးပါ။"
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
      <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-8 relative overflow-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isEditMode ? "ကစားသမားပြင်ဆင်ရန်" : "ကစားသမားအသစ်ထည့်ရန်"}
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
              ကစားသမားအိုင်ဒီ
            </label>
            <input
              type="text"
              name="uid"
              value={values.uid}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              readOnly={isEditMode}
            />
            {!isEditMode && (
              <button
                type="button"
                onClick={handleGenerateUID}
                className="mt-2 w-full bg-blue-500 text-white py-1"
              >
                ကစားသမားအိုင်ဒီအသစ်ထုတ်ရန်
              </button>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              ကစားသမားအမည်
            </label>
            <input
              type="text"
              name="username"
              value={values.username}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          {!isEditMode && (
            <>
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
                  required={!isEditMode}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ယခုကစားသမားအသစ်ထဲသို့ထည့်မည့်ယူနစ်ပမာဏ
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
            </>
          )}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              ငွေကြေးအမျိုးအစား
            </label>
            <select
              name="currency"
              value={values.currency}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MMK">MMK</option>
              {/* Add other currency options if needed */}
            </select>
          </div>
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
          {isEditMode && (
            <>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ယူနစ်ပမာဏ
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
                  ကစားသမားအခြေအနေ
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
            </>
          )}

          <button className="w-full bg-green-600 text-white py-2 col-span-1 sm:col-span-2">
            {isEditMode ? "ကစားသမားပြင်ဆင်မည်" : "ကစားသမားအသစ်ဖန်တီးမည်"}
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

export default PlayerRegister;
