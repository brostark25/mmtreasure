import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const LoginPopup = () => {
  const [values, setValues] = useState({
    uid: "",
    password: "",
  });
  const [userIp, setUserIp] = useState(""); // State to store user's IP address
  const [error, setError] = useState(""); // State for error message
  const navigate = useNavigate();

  // Fetch user's IP address on component mount
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        setUserIp(response.data.ip);
      } catch (err) {
        console.error("Failed to fetch IP address:", err);
      }
    };
    fetchIp();
  }, []);

  const handleChanges = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Clear any previous errors
    try {
      const payload = {
        ...values,
        ip: userIp, // Include the user's IP address in the payload
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/user/login`,
        payload
      );

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token); // Save token in localStorage
        navigate("/"); // Redirect to home page or a protected route
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Server Error. Please try again later.");
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-slate-900 w-80 p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-4 text-white">လော့အင်</h2>
        {error && <p className="mb-4 text-red-500 text-sm">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="uid"
            placeholder="ကစားသမားအိုင်ဒီ"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            onChange={handleChanges}
          />
          <input
            type="password"
            name="password"
            placeholder="ပက်စ်ဝေါ့"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            onChange={handleChanges}
          />
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            အကောင့်ဝင်မည်
          </button>
        </form>
        <button className="mt-4 text-blue-600 hover:underline">
          <Link to="/">ပိတ်မည်</Link>
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
