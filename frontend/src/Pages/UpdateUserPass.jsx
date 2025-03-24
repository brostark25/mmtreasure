import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const UpdateUserPass = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); // Success message
  const [error, setError] = useState(""); // Error message

  const navigate = useNavigate();

  // Handle password update submission
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setMessage("");
      return;
    }

    try {
      const token = localStorage.getItem("token"); // Get JWT token from localStorage
      if (!token) throw new Error("No token found");

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/user/update_upassword`,
        { newPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage(response.data.message); // Show success message
        setError("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      // Handle error
      setError(err.response?.data?.message || "Something went wrong.");
      setMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-600">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Update Password
        </h3>

        {/* Show success or error message */}
        {message && <p className="text-green-500 text-sm mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handlePasswordUpdate}>
          <div className="mb-4">
            <label className="block text-gray-700">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end mt-6 space-x-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded"
            >
              Update
            </button>
            <button
              type="button"
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateUserPass;
