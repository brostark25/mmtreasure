import React, { useState } from "react";
import axios from "axios";

const UpdatePasswordModal = ({
  isOpen,
  onClose,
  selectedUser,
  selectedAgent,
  onPasswordUpdated,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      let endpoint, payload;

      if (selectedUser) {
        // Update user password
        endpoint = `${import.meta.env.VITE_API_URL}/user/update_upassword`;
        payload = {
          userId: selectedUser.uid, // Use `userId` instead of `uid`
          newPassword,
        };
      } else if (selectedAgent) {
        // Update agent password
        endpoint = `${import.meta.env.VITE_API_URL}/admin/update_password`;
        payload = { agid: selectedAgent.agid, newPassword };
      } else {
        throw new Error("ကစားသမား (သို့) အေးဂျင့်ရွေးချယ်ထားခြင်းမရှိသေးပါ။");
      }

      const response = await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert("Password ပြောင်းလဲခြင်းအောင်မြင်ပါသည်။");
        // onPasswordUpdated();
        onClose();
      } else {
        throw new Error("Password ပြောင်းလဲခြင်းမအောင်မြင်ပါ။");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      setError("Password ပြောင်းလဲခြင်းအောင်မြင်ပါသဖြင့် ထပ်မံကြိုးစားပေးပါ။");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 sm:p-6"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-4 text-gray-800">
          Password ပြောင်းရန်
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="text-gray-700 text-sm sm:text-base space-y-4">
            <p className="text-justify">
              {selectedUser
                ? `ကစားသမားအိုင်ဒီ : ${selectedUser.uid} အတွက် password ပြောင်းလဲမည်။`
                : `အေးဂျင့်အိုင်ဒီ : ${selectedAgent?.agid} အတွက် password ပြောင်းလဲမည်။`}
            </p>
            <input
              type="password"
              className="border rounded-md p-2 w-full mb-4 focus:ring-2 focus:ring-blue-400"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-between gap-4">
              <button
                type="button"
                className="w-1/2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
