import React, { useState } from "react";
import axios from "axios";

const EditActiveStatusModal = ({
  isOpen,
  onClose,
  selectedUser = null, // Default value for selectedUser
  selectedAgent = null, // Default value for selectedAgent
  onStatusUpdated,
}) => {
  // Convert active status from database (1 or 0) to boolean (true or false)
  const initialActiveStatus = selectedUser
    ? selectedUser.active === 1
    : selectedAgent
    ? selectedAgent.active === 1
    : false;

  const [active, setActive] = useState(initialActiveStatus);
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
        // Update user active status
        endpoint = `${
          import.meta.env.VITE_API_URL
        }/user/update_user_active_status`;
        payload = {
          userId: selectedUser.uid,
          active: active ? 1 : 0, // Convert boolean back to 1 or 0 for the database
        };
      } else if (selectedAgent) {
        // Update agent active status
        endpoint = `${
          import.meta.env.VITE_API_URL
        }/admin/update_agent_active_status`;
        payload = {
          agid: selectedAgent.agid,
          active: active ? 1 : 0, // Convert boolean back to 1 or 0 for the database
        };
      } else {
        throw new Error("No user or agent selected.");
      }

      const response = await axios.put(endpoint, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert("Active status updated successfully!");
        onStatusUpdated();
        onClose();
      } else {
        throw new Error("Failed to update active status.");
      }
    } catch (error) {
      console.error("Error updating active status:", error);
      setError("Failed to update active status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Do not render the modal if neither selectedUser nor selectedAgent is provided
  if (!isOpen || (!selectedUser && !selectedAgent)) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 sm:p-6"
      style={{ zIndex: 1000 }}
    >
      <div className="bg-white rounded-lg p-5 sm:p-6 w-full max-w-md shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold text-center mb-4 text-gray-800">
          Edit Active Status
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="text-gray-700 text-sm sm:text-base space-y-4">
            <p className="text-justify">
              {selectedUser
                ? `Editing active status for User ID: ${selectedUser.uid}`
                : `Editing active status for Agent ID: ${selectedAgent?.agid}`}
            </p>
            <div className="flex items-center">
              <label className="mr-2">Active:</label>
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
            </div>
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

export default EditActiveStatusModal;
