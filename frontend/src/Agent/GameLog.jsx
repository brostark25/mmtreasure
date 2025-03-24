import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

const GameLog = ({ playerId }) => {
  const [selectedGame, setSelectedGame] = useState("PRAGMATIC SLOT");
  const [trxId, setTrxId] = useState("");
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [fromTime, setFromTime] = useState("00:00:00");
  const [toTime, setToTime] = useState("23:59:59");
  const [loading, setLoading] = useState(false);
  const [showData, setShowData] = useState(false);
  const [error, setError] = useState(null);
  const [filteredPlayerData, setFilteredPlayerData] = useState([]);

  const handleQuickDateRange = (type) => {
    const today = new Date();
    let start, end;
    switch (type) {
      case "TODAY":
        start = new Date(today);
        end = new Date(today);
        break;
      case "YESTERDAY":
        start = new Date(today.setDate(today.getDate() - 1));
        end = new Date(start);
        break;
      case "THIS_WEEK":
        start = new Date(today.setDate(today.getDate() - today.getDay()));
        end = new Date();
        break;
      case "LAST_WEEK":
        start = new Date(today.setDate(today.getDate() - today.getDay() - 7));
        end = new Date(today.setDate(today.getDate() - today.getDay() - 1));
        break;
      case "THIS_MONTH":
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date();
        break;
      case "LAST_MONTH":
        start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        end = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      default:
        return;
    }
    setFromDate(start);
    setToDate(end);
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked!");

    setLoading(true);
    setError(null);

    try {
      const timepointFrom = fromDate
        ? fromDate.getTime()
        : new Date().setHours(0, 0, 0, 0);

      const timepointTo = toDate
        ? toDate.getTime()
        : new Date().setHours(23, 59, 59, 999);

      console.log(
        "Requesting data from:",
        new Date(timepointFrom),
        "to",
        new Date(timepointTo)
      );

      const pplogin = process.env.PRAGMATIC_PROVIDER_ID || "brm03_burma03";
      const pppass = process.env.PRAGMATIC_API_KEY || "a6Zt7KS2OAOBGnNA";

      console.log("Using login:", pplogin, "password:", pppass);

      const queryParams = new URLSearchParams({
        login: pplogin,
        password: pppass,
        timepointFrom: timepointFrom.toString(),
        timepointTo: timepointTo.toString(),
        playerID: playerId, // Use the playerId prop directly
      });

      console.log(
        "API Endpoint:",
        `${import.meta.env.VITE_API_URL}/report/game-rounds?${queryParams}`
      );

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/report/game-rounds?${queryParams}`
      );

      console.log("Response received:", response.data);

      // Filter data for the specific playerId
      const filteredData = response.data?.data.filter(
        (row) => row._1 === playerId
      );

      // Format the filtered data
      const formattedData = filteredData.map((row) => ({
        playerID: row._1,
        bet: parseFloat(row._9) || 0,
        win: parseFloat(row._10) || 0,
        currency: row._11,
        startDate: row._5,
        endDate: row._6,
        status: row._7,
        bbalance: parseFloat(row._13) || 0,
        sessionid: row._3,
        gamecode: row._2,
        provider: "Pragmatic Play",
      }));

      setFilteredPlayerData(formattedData);
      setShowData(true);
    } catch (err) {
      console.error("Error fetching report data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Game Log</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Game
          </label>
          <select
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedGame}
            onChange={(e) => setSelectedGame(e.target.value)}
          >
            <option value="PRAGMATIC SLOT">Pragmatic Slot</option>
            <option value="BLACKJACK">Blackjack</option>
            <option value="ROULETTE">Roulette</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Player ID
          </label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={playerId}
            readOnly
            placeholder="Auto-filled with Player ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            Transaction ID
          </label>
          <input
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={trxId}
            onChange={(e) => setTrxId(e.target.value)}
            placeholder="Enter Transaction ID"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            From Date
          </label>
          <DatePicker
            selected={fromDate}
            onChange={setFromDate}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            To Date
          </label>
          <DatePicker
            selected={toDate}
            onChange={setToDate}
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            From Time
          </label>
          <input
            type="time"
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-gray-700">
            To Time
          </label>
          <input
            type="time"
            className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="mt-6 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span className="ml-2">Loading...</span>
          </div>
        ) : (
          "Submit"
        )}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {showData && (
        <div className="mt-6 overflow-x-auto">
          <div className="min-w-[800px] h-[300px]">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-left">Player ID</th>
                  <th className="border p-3 text-left">Bet Time</th>
                  <th className="border p-3 text-left">Result Time</th>
                  <th className="border p-3 text-left">Session Id</th>
                  <th className="border p-3 text-left">Game Code</th>
                  <th className="border p-3 text-left">Before AMT</th>
                  <th className="border p-3 text-left">Bet</th>
                  <th className="border p-3 text-left">Win</th>
                  <th className="border p-3 text-left">Win/Lose</th>
                  <th className="border p-3 text-left">After AMT</th>
                  <th className="border p-3 text-left">Status</th>
                  <th className="border p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayerData.map((row, index) => {
                  const playerWL = row.win - row.bet;
                  const afterAmt = row.bbalance + playerWL;
                  const wlColor =
                    playerWL < 0 ? "text-red-500" : "text-green-500";

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border p-3">{row.playerID}</td>
                      <td className="border p-3">{row.startDate}</td>
                      <td className="border p-3">{row.endDate}</td>
                      <td className="border p-3">{row.sessionid}</td>
                      <td className="border p-3">{row.gamecode}</td>
                      <td className="border p-3">
                        {Number(row.bbalance.toFixed(2)).toLocaleString()}
                      </td>
                      <td className="border p-3">
                        {Number(row.bet.toFixed(2)).toLocaleString()}
                      </td>
                      <td className="border p-3">
                        {Number(row.win.toFixed(2)).toLocaleString()}
                      </td>
                      <td className={`border p-3 ${wlColor}`}>
                        {Number(playerWL.toFixed(2)).toLocaleString()}
                      </td>
                      <td className="border p-3">
                        {Number(afterAmt.toFixed(2)).toLocaleString()}
                      </td>
                      <td className="border p-3">
                        {row.win === 0 ? "Bet" : "Settled"}
                      </td>
                      <td className="border p-3">
                        <button className="text-blue-600 hover:text-blue-800">
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameLog;