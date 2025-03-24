import React, { useState, useEffect } from "react";
import axios from "axios";
import MainLayout from "../Layout/MainLayout";
import { jwtDecode } from "jwt-decode";
import CryptoJS from "crypto-js";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const UserGameRecords = () => {
  const [selectedGame, setSelectedGame] = useState("PRAGMATIC SLOT");
  const [playerId, setPlayerId] = useState("");
  const [gameId, setGameId] = useState("");
  const [trxId, setTrxId] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromTime, setFromTime] = useState("00:00:00");
  const [toTime, setToTime] = useState("23:59:59");
  const [loading, setLoading] = useState(false);
  const [gameLogs, setGameLogs] = useState([]);
  const [error, setError] = useState("");
  const [games, setGames] = useState([]); // State to hold the list of games
  const [datePlayed, setDatePlayed] = useState("");
  const [userBalance, setUserBalance] = useState(0);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken?.u) {
          setPlayerId(decodedToken.u);
        } else {
          console.error("Player ID not found in token");
          setError("Player ID not found. Please log in again.");
        }
      } catch (err) {
        console.error("Failed to decode token:", err);
        setError("Invalid token. Please log in again.");
      }
    }
  }, []);


  useEffect(() => {
    const fetchUserBalance = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/uhome`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const { balance } = response.data.user;
        setUserBalance(balance);
      } catch (err) {
        console.error("Failed to fetch user balance:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    };

    fetchUserBalance();
  }, [playerId]);


  useEffect(() => {
    const fetchPlayedGames = async () => {
      try {
        const payload = {
          playerId,
          datePlayed: datePlayed.trim(),
          timeZone: "GMT+00:00",
        };

        // Generate hash for GetPlayedGames request
        const hashString = `datePlayed=${payload.datePlayed}&playerId=${payload.playerId}&secureLogin=brm03_burma03&timeZone=${payload.timeZone}`;
        const hash = CryptoJS.MD5(hashString).toString(CryptoJS.enc.Base64);

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/report/get-played-games`,
          { ...payload, hash },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.status === 200 && response.data.games) {
          setGames(response.data.games);
        } else {
          setGames([]);
        }
      } catch (error) {
        console.error("Error fetching casino games:", error);
        setGames([]);
      }
    };

    if (playerId && datePlayed) {
      fetchPlayedGames();
    }
  }, [playerId, datePlayed]);



  const handleQuickDateRange = () => {
    const today = new Date();
    let start, end;
    setFromDate(start);
    setToDate(end);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(""); // Reset error message

    if (!playerId) {
      console.error("Player ID is missing");
      setError("Player ID is missing. Please log in again.");
      setLoading(false);
      return;
    }

    if (games.length === 0) {
      console.error("No game found for the selected date.");
      setError("No game found for the selected date. Please try a different date.");
      setLoading(false);
      return;
    }

    const selectedGameId = games[0]?.gameId; // Ensure we have a valid gameId
    if (!selectedGameId) {
      console.error("Game ID is missing");
      setError("Game ID is missing. Please select a valid game.");
      setLoading(false);
      return;
    }

    try {
      const formData = new URLSearchParams();
      formData.append('playerId', playerId);
      formData.append('datePlayed', fromDate.toISOString().split("T")[0]);
      formData.append('timeZone', "UTC");
      formData.append('gameId', selectedGameId);
      formData.append('hour', fromTime.split(":")[0]);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/report/histgame-rounds`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      const data = await response.json();
      console.log("API Response:", data);

      if (Array.isArray(data.rounds)) {
        setGameLogs(data.rounds);
      } else {
        console.error("Invalid data format:", data);
        setGameLogs([]);
      }
    } catch (error) {
      console.error("Error fetching game logs:", error);
      setError("An error occurred while fetching game logs. Please try again.");
      setGameLogs([]);
    }

    setLoading(false);
  };


  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4">
        <h1 className="text-3xl text-center pt-10 pb-6 font-semibold">Game Records</h1>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6">
          <div>
            <label className="block font-medium">From Date</label>
            <DatePicker selected={fromDate} onChange={setFromDate} className="w-full border p-2 rounded" />
          </div>
          <div>
          	<label className="block font-medium">To Date</label>
          	<DatePicker selected={toDate} onChange={setToDate} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block font-medium">From Time</label>
            <input type="time" className="w-full border p-2 rounded" value={fromTime} onChange={(e) => setFromTime(e.target.value)} />
          </div>
          <div>
            <label className="block font-medium">To Time</label>
            <input type="time" className="w-full border p-2 rounded" value={toTime} onChange={(e) => setToTime(e.target.value)} />
          </div>
          <button onClick={handleSubmit} className="mt-4 w-full bg-blue-500 text-white p-2 rounded">
            Submit
          </button>
        </div>

        {loading ? (
          <p className="text-center text-xl">Loading...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left table-auto">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="p-4 text-lg font-semibold">No.</th>
                  <th className="p-4 text-lg font-semibold">Amount</th>
                  <th className="p-4 text-lg font-semibold">Update Balance</th>
                  <th className="p-4 text-lg font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
            {(Array.isArray(gameLogs) && gameLogs.length > 0) ? (
              gameLogs.map((log, index) => {
                const beforeAmt =
                  log.winAmount !== 0.0
                    ? log.balance - log.winAmount + log.betAmount
                    : log.balance + log.betAmount;
                return (
                    <tr key={index} className="border-b border-gray-700">
                      <td className="p-4">{index + 1}</td>
                      <td className="p-4">
                        {(log.winAmount !== 0.0
                           ? log.balance - log.winAmount + log.betAmount
                           : log.balance + log.betAmount).toFixed(2)}
                      </td>
                      <td className="p-4">{log.balance || "N/A"}</td>
                      <td className="p-4">{log.dateTime}</td>
                    </tr>
                  );
                })
                ) : (
                  <tr>
                    <td colSpan="4" className="p-4 text-center">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UserGameRecords;
