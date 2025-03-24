import React, { useState } from "react";
import axios from "axios";

const UpdatePasswordForm = () => {
  const [agid, setAgid] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/admin/update_password`,
        {
          agid,
          newPassword,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage(response.data.message);
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div>
      <h2>Update Password</h2>
      <form onSubmit={handleUpdatePassword}>
        <div>
          <label>Agent ID:</label>
          <input
            type="text"
            value={agid}
            onChange={(e) => setAgid(e.target.value)}
            required
          />
        </div>
        <div>
          <label>New Password:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Password</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UpdatePasswordForm;
