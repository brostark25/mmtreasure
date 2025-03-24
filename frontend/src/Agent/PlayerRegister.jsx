import React, { useState, useEffect } from "react";
import axios from "axios";

const PlayerRegister = ({ isOpen, onClose, onUserAdded }) => {
  const [values, setValues] = useState({
    uid: "",
    currency: "",
    balance: "",
    username: "",
    password: "",
    active: 1,
    agentreferral: "",
  });

  const [agentBalance, setAgentBalance] = useState(null);
  const [agent, setAgent] = useState(null);

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
          setAgent(response.data.agent);
          setValues((prevValues) => ({
            ...prevValues,
            agentreferral: response.data.agent.agid,
          }));
          // setAgentBalance(response.data.agent.balance);
        }
      } catch (error) {
        console.error("Error fetching agent balance:", error);
      }
    };

    fetchAgentData();
  }, []);

  // Generate a 6-digit random User ID with the prefix "B"
  const generateRandomUID = () =>
    `B${Math.floor(100000 + Math.random() * 900000)}`;

  // Check if the generated UID is unique
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

  // Generate and set a unique UID when the button is clicked
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
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Register the user in your system
      const userResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/register`,
        values
      );

      if (userResponse.status === 201) {
        alert("Player successfully created and balance transferred!");
        onUserAdded(values); // Notify the parent about the new user
        onClose(); // Close the modal
      } else {
        alert("Player creation failed.");
      }

      // if (userResponse.status === 201) {
      //   const { uid } = values;

      //   // Step 2: Create the account via the SOAP API
      //   const createAccountResponse = await axios.post(
      //     `${import.meta.env.VITE_API_URL}/api/ibet/sportbook/createaccount`,
      //     { userName: uid }
      //   );

      //   if (createAccountResponse.data.success) {
      //     // Step 3: Transfer initial balance
      //     const transferResponse = await axios.post(
      //       `${
      //         import.meta.env.VITE_API_URL
      //       }/api/ibet/sportbook/transferfundref`,
      //       {
      //         userName: uid,
      //         serial: `${Date.now()}`, // Use a timestamp as a unique serial
      //         amount: values.balance,
      //       }
      //     );

      //     if (transferResponse.data.success) {
      //       alert("Player successfully created and balance transferred!");
      //       onUserAdded(values); // Notify the parent about the new user
      //       onClose(); // Close the modal
      //     } else {
      //       alert("Player created, but balance transfer failed.");
      //     }
      //   } else {
      //     alert("Player creation failed.");
      //   }
      // }
    } catch (err) {
      console.error(err);
      alert("Error during registration or player creation.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg w-full max-w-2xl p-8 relative">
        <h2 className="text-2xl font-bold mb-6 text-center">Add User</h2>
        {/* Display Logged-in Agent Balance */}
        {agent && (
          <div className="mb-4">
            <label className="inline text-gray-700 font-semibold mb-2">
              Current Agent Balance
            </label>
            <span className="text-green-600 pl-10">{agent.balance}</span>
          </div>
        )}
        <form className="grid grid-cols-2 gap-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              User ID
            </label>
            <input
              type="text"
              name="uid"
              value={values.uid}
              onChange={handleChanges}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleGenerateUID}
              className="mt-2 w-full bg-blue-500 text-white py-1"
            >
              Generate User ID
            </button>
          </div>
          <div className="mb-4">
            <label htmlFor="currency" className="block text-gray-700">
              Currency
            </label>
            <select
              name="currency"
              className="w-full px-3 py-2 border bg-white"
              onChange={handleChanges}
              value={values.currency}
            >
              <option value="" disabled>
                Select Currency
              </option>
              <option value="MMK">MMK</option>
              {/* <option value="THB">THB</option>
              <option value="USDT">USDT</option> */}
            </select>
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
          <div className="mb-4">
            <label htmlFor="balance" className="block text-gray-700">
              Balance
            </label>
            <input
              type="text"
              placeholder="Enter Balance"
              className="w-full px-3 py-2 border"
              name="balance"
              onChange={handleChanges}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter Username"
              className="w-full px-3 py-2 border"
              name="username"
              onChange={handleChanges}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full px-3 py-2 border"
              name="password"
              onChange={handleChanges}
            />
          </div>

          <button className="w-full bg-green-600 text-white py-2">
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

export default PlayerRegister;
