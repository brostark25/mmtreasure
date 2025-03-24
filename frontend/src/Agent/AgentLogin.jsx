import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const AgentLogin = () => {
  const [values, setValues] = useState({
    agid: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/admin/login`,
        values
      );

      if (response.status === 201) {
        const { token, agent } = response.data;

        if (agent.arole === "Admin" || agent.arole === "Agent") {
          localStorage.setItem("token", token);
          navigate("/agent"); // Redirect to the dashboard
        } else {
          setErrorMessage("Unauthorized access.");
        }
      }
    } catch (err) {
      setErrorMessage("An error occurred. Please check your connection.");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700">
      <div className="bg-white w-full max-w-md p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Agent Login
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              name="agid"
              placeholder="Agent ID"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleChanges}
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onChange={handleChanges}
              required
            />
          </div>
          {errorMessage && (
            <p className="text-red-600 text-sm mb-4">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-all"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <button className="text-indigo-600 hover:underline">
            <Link to="/">Close</Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AgentLogin;
