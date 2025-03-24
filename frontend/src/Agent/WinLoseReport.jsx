import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import _ from "lodash";
import GameLog from "./GameLog"; // Import the GameLog component

const gameProviders = [
  "PRAGMATIC SLOT",
  "Ibet789",
  "Shan Koe Mee",
  "Live22",
  "JILI",
  "Victory Ark",
];

const WinLoseReport = () => {
  const [selectedDateFrom, setSelectedDateFrom] = useState(null);
  const [selectedDateTo, setSelectedDateTo] = useState(null);
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [playerID, setPlayerID] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agentID, setAgentID] = useState("");
  const [createdAgents, setCreatedAgents] = useState([]);
  const [subCreatedAgents, setSubCreatedAgents] = useState({});
  const [createdUsers, setCreatedUsers] = useState({});
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [currentTable, setCurrentTable] = useState("agents");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [providerData, setProviderData] = useState([]);
  const [breadcrumb, setBreadcrumb] = useState(["Agents"]);
  const [filteredPlayerData, setFilteredPlayerData] = useState([]);
  const [shouldFetchAgents, setShouldFetchAgents] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState("");
  const [isGameLogModalOpen, setIsGameLogModalOpen] = useState(false);
  const [selectedProviderPlayerId, setSelectedProviderPlayerId] = useState("");

  useEffect(() => {
    setSelectedProviders(gameProviders);
  }, []);

  const toggleProvider = (provider) => {
    setSelectedProviders((prev) =>
      prev.includes(provider)
        ? prev.filter((p) => p !== provider)
        : [...prev, provider]
    );
  };

  const checkDataInDatabase = async (timepointFrom, timepointTo, playerID) => {
    try {
      const queryParams = new URLSearchParams({
        timepointFrom: timepointFrom.toString(),
        timepointTo: timepointTo.toString(),
        ...(playerID && { playerID: playerID }),
      });

      const response = await axios.get(
        `${
          import.meta.env.VITE_API_URL
        }/report/game-rounds-from-db?${queryParams}`
      );

      return response.data.data; // Return the data if it exists
    } catch (error) {
      console.error("Error checking data in database:", error.message);
      return null; // Return null if there's an error
    }
  };

  const handleSubmit = async () => {
    console.log("Submit button clicked!");

    setLoading(true);
    setError(null);

    try {
      const timepointFrom = selectedDateFrom
        ? selectedDateFrom.getTime()
        : new Date().setHours(0, 0, 0, 0);

      const timepointTo = selectedDateTo
        ? selectedDateTo.getTime()
        : new Date().setHours(23, 59, 59, 999);

      console.log(
        "Requesting data from:",
        new Date(timepointFrom),
        "to",
        new Date(timepointTo)
      );

      // If both From and To dates are empty, fetch the latest data from the API
      if (!selectedDateFrom && !selectedDateTo) {
        console.log("Fetching latest data from API...");

        const pplogin = process.env.PRAGMATIC_PROVIDER_ID || "brm03_burma03";
        const pppass = process.env.PRAGMATIC_API_KEY || "a6Zt7KS2OAOBGnNA";

        console.log("Using login:", pplogin, "password:", pppass);

        const queryParams = new URLSearchParams({
          login: pplogin,
          password: pppass,
          ...(playerID && { playerID: playerID }),
        });

        console.log(
          "API Endpoint:",
          `${import.meta.env.VITE_API_URL}/report/game-rounds?${queryParams}`
        );

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/report/game-rounds?${queryParams}`
        );

        console.log("Response received:", response.data);

        // Format the new data
        const formattedData = response.data?.data.map((row) => ({
          playerID: row.playerID,
          gameID: row.gameID,
          playSessionID: row.playSessionID,
          timepoint: row.timepoint,
          startDate: row.startDate,
          endDate: row.endDate,
          bet: parseFloat(row.bet) || 0,
          win: parseFloat(row.win) || 0,
          beforeamt: parseFloat(row.beforeamt),
          status: row.status,
		  provider: row.provider,
        }));

        // Filter out rows where both win and bet are 0
        const filteredResults = formattedData.filter(
          (row) => row.bet !== 0 || row.win !== 0
        );

        // Sort the data by playSessionID in descending order
        filteredResults.sort((a, b) => b.playSessionID - a.playSessionID);

        setReportData(filteredResults);

        // Filter the data locally if playerID is provided
        if (playerID) {
          const filteredData = filteredResults.filter(
            (row) => row.playerID === playerID
          );
          setFilteredPlayerData(filteredData);
        } else {
          setFilteredPlayerData(filteredResults);
        }
      } else {
        // If dates are provided, check the database first
        console.log(
          "Checking database for data from:",
          new Date(timepointFrom),
          "to",
          new Date(timepointTo)
        );

        const existingData = await checkDataInDatabase(
          timepointFrom,
          timepointTo,
          playerID
        );

        if (existingData && existingData.length > 0) {
          console.log("Data found in database:", existingData);

          // Format the existing data
          const formattedData = existingData.map((row) => ({
            playerID: row.playerID,
            gameID: row.gameID,
            playSessionID: row.playSessionID,
            timepoint: row.timepoint,
            startDate: row.startdate,
            endDate: row.enddate,
            bet: parseFloat(row.betamt) || 0,
            win: parseFloat(row.winamt) || 0,
            beforeamt: parseFloat(row.beforeamt),
            status: row.status,
			provider: row.provider,
          }));

          // Filter out rows where both win and bet are 0
          const filteredResults = formattedData.filter(
            (row) => row.bet !== 0 || row.win !== 0
          );

          // Sort the data by playSessionID in descending order
          filteredResults.sort((a, b) => b.playSessionID - a.playSessionID);

          setReportData(filteredResults);

          // Filter the data locally if playerID is provided
          if (playerID) {
            const filteredData = filteredResults.filter(
              (row) => row.playerID === playerID
            );
            setFilteredPlayerData(filteredData);
          } else {
            setFilteredPlayerData(filteredResults);
          }
        } else {
          console.log(
            "No data found in database. Fetching new data from API..."
          );

          const pplogin = process.env.PRAGMATIC_PROVIDER_ID || "brm03_burma03";
          const pppass = process.env.PRAGMATIC_API_KEY || "a6Zt7KS2OAOBGnNA";

          console.log("Using login:", pplogin, "password:", pppass);

          const queryParams = new URLSearchParams({
            login: pplogin,
            password: pppass,
            timepointFrom: timepointFrom.toString(),
            timepointTo: timepointTo.toString(),
            ...(playerID && { playerID: playerID }),
          });

          console.log(
            "API Endpoint:",
            `${import.meta.env.VITE_API_URL}/report/game-rounds?${queryParams}`
          );

          const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/report/game-rounds?${queryParams}`
          );

          console.log("Response received:", response.data);

          // Format the new data
          const formattedData = response.data?.data.map((row) => ({
            playerID: row.playerID,
            gameID: row.gameID,
            playSessionID: row.playSessionID,
            timepoint: row.timepoint,
            startDate: row.startDate,
            endDate: row.endDate,
            bet: parseFloat(row.bet) || 0,
            win: parseFloat(row.win) || 0,
            beforeamt: parseFloat(row.beforeamt),
            status: row.status,
          }));

          // Filter out rows where both win and bet are 0
          const filteredResults = formattedData.filter(
            (row) => row.bet !== 0 || row.win !== 0
          );

          // Sort the data by playSessionID in descending order
          filteredResults.sort((a, b) => b.playSessionID - a.playSessionID);

          setReportData(filteredResults);

          // Filter the data locally if playerID is provided
          if (playerID) {
            const filteredData = filteredResults.filter(
              (row) => row.playerID === playerID
            );
            setFilteredPlayerData(filteredData);
          } else {
            setFilteredPlayerData(filteredResults);
          }
        }
      }

      // Fetch agents after the report data is fetched
      setShouldFetchAgents(true);
    } catch (err) {
      console.error("Error fetching report data:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shouldFetchAgents) return;

    const fetchAgent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/admin/agent_dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.agent) {
          setAgentID(response.data.agent.agid);
          console.log(
            "Agent ID fetched successfully:",
            response.data.agent.agid
          );
        } else {
          console.error("Failed to fetch agent data or missing agent ID");
        }
      } catch (error) {
        console.error("Error fetching agent data:", error);
      }
    };

    fetchAgent();
  }, [shouldFetchAgents]);

  useEffect(() => {
    if (!agentID || !shouldFetchAgents) return;

    const fetchCreatedAgents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/report/created-agents?agentID=${agentID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 200 && response.data.agents) {
          setCreatedAgents(response.data.agents);
          console.log(
            "Created agents fetched successfully:",
            response.data.agents
          );
        } else {
          console.error(
            "Failed to fetch created agents or missing agents data"
          );
        }
      } catch (error) {
        console.error("Error fetching created agents:", error);
      }
    };

    fetchCreatedAgents();
  }, [agentID, shouldFetchAgents]);

  const handleAgentClick = async (agentId) => {
    setSelectedAgent(agentId);
    setCurrentTable("subagents");
    setBreadcrumb([...breadcrumb, `${agentId}`]);

    if (!subCreatedAgents[agentId]) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/report/created-agents-and-users?agentID=${agentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const agents = Array.isArray(response.data.agents)
          ? response.data.agents
          : [];
        setSubCreatedAgents((prev) => ({
          ...prev,
          [agentId]: agents,
        }));

        const users = Array.isArray(response.data.users)
          ? response.data.users
          : [];

        setCreatedUsers((prev) => ({
          ...prev,
          [agentId]: users || [],
        }));

        // Filter player data based on the users of the selected agent
        const playerIDs = users.map((user) => user.uid);
        console.log("Players IDs From Handle Agent Click : ", playerIDs);
        const filteredData = reportData.filter((row) =>
          playerIDs.includes(row.playerID)
        );
        setFilteredPlayerData(filteredData);
      } catch (error) {
        console.error("Error fetching sub agents or users:", error);
      }
    }
  };

  const handleSubAgentClick = async (agentId) => {
    setSelectedAgent(agentId);
    setCurrentTable("users");
    setBreadcrumb([...breadcrumb, `Sub Agent ${agentId}`]);

    if (!createdUsers[agentId]) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${
            import.meta.env.VITE_API_URL
          }/report/created-agents-and-users?agentID=${agentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setCreatedUsers((prev) => ({
          ...prev,
          [agentId]: response.data.users || [],
        }));

        // Filter player data based on the users of the selected sub-agent
        const playerIDs = response.data.users.map((user) => user.uid);
        console.log("Players IDs From Handle Sub Agent Click : ", playerIDs);
        const filteredData = reportData.filter((row) =>
          playerIDs.includes(row.playerID)
        );
        setFilteredPlayerData(filteredData);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
  };

  const handlePlayerClick = (playerID) => {
    setSelectedPlayer(playerID);

    const playerData = reportData.filter((row) => row.playerID === playerID);
    const groupedByProvider = _.groupBy(playerData, "provider");

    const formattedProviderData = Object.keys(groupedByProvider).map(
      (providerKey) => {
        const providerGames = groupedByProvider[providerKey];
        return {
          provider: providerKey, // Use providerKey instead of provider
          // pbet: providerGames.map((game) => parseFloat(game.bet) || 0), // Convert to array of bets
          // pwin: providerGames.map((game) => parseFloat(game.win) || 0), // Convert to array of wins
          bbalance: providerGames.map((game) => parseFloat(game.bbalance) || 0), // Convert to array of balance
          totalBet: _.sumBy(providerGames, (game) => _.sum(game.bet) || 0),
          totalWin: _.sumBy(providerGames, (game) => _.sum(game.win) || 0),
          currency: providerGames[0].currency,
          startDate: providerGames[0].startDate,
          endDate: providerGames[providerGames.length - 1].endDate,
          status: providerGames[0].status,
        };
      }
    );

    setProviderData(formattedProviderData);
  };

  const handleProviderClick = (playerID) => {
    setSelectedProviderPlayerId(playerID); // Set the Player ID for GameLog
    setIsGameLogModalOpen(true); // Open the GameLog modal
  };

  const handleBack = () => {
    if (currentTable === "subagents") {
      setCurrentTable("agents");
      setSelectedAgent(null);
      setBreadcrumb(["Agents"]);
      // Reset filtered player data to show all players
      setFilteredPlayerData(reportData);
    } else if (currentTable === "users") {
      setCurrentTable("subagents");
      setSelectedAgent(null);
      setBreadcrumb(breadcrumb.slice(0, -1));
      // Filter player data based on the selected agent's users
      const playerIDs =
        createdUsers[selectedAgent]?.map((user) => user.uid) || [];
      const filteredData = reportData.filter((row) =>
        playerIDs.includes(row.playerID)
      );
      setFilteredPlayerData(filteredData);
    }
  };

  return (
    <div className="p-6 text-gray-800">
      <h2 className="text-2xl font-bold mb-4">WinLose Report</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {gameProviders.map((provider) => (
          <button
            key={provider}
            className={`px-4 py-2 rounded-lg border ${
              selectedProviders.includes(provider)
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => toggleProvider(provider)}
          >
            {provider}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm sm:text-lg font-medium mb-2">
            From:
          </label>
          <DatePicker
            selected={selectedDateFrom}
            onChange={(date) => setSelectedDateFrom(date)}
            className="w-full border-gray-600 bg-gray-700 text-white p-2 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm sm:text-lg font-medium mb-2">
            To:
          </label>
          <DatePicker
            selected={selectedDateTo}
            onChange={(date) => setSelectedDateTo(date)}
            className="w-full border-gray-600 bg-gray-700 text-white p-2 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Player ID:</label>
          <input
            type="text"
            value={playerID}
            onChange={(e) => setPlayerID(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter Player ID"
          />
        </div>
      </div>
      <button
        onClick={handleSubmit}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
        disabled={loading}
      >
        {loading ? "Loading..." : "Submit"}
      </button>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      <div className="space-y-4">
        <div className="breadcrumb p-2 bg-gray-200 mb-4 rounded">
          {breadcrumb.map((crumb, index) => (
            <span key={index}>
              {index > 0 && " > "}
              <button
                className="text-blue-500"
                onClick={() => {
                  if (index === 0) {
                    setCurrentTable("agents");
                    setSelectedAgent(null);
                    setBreadcrumb(["Agents"]);
                    setFilteredPlayerData(reportData);
                  } else if (index === 1) {
                    setCurrentTable("subagents");
                    setSelectedAgent(null);
                    setBreadcrumb(["Agents", `Agent ${selectedAgent}`]);
                    const playerIDs =
                      createdUsers[selectedAgent]?.map((user) => user.uid) ||
                      [];
                    const filteredData = reportData.filter((row) =>
                      playerIDs.includes(row.playerID)
                    );
                    setFilteredPlayerData(filteredData);
                  } else if (index === 2) {
                    setCurrentTable("users");
                    setSelectedAgent(null);
                    setBreadcrumb([
                      "Agents",
                      `Agent ${selectedAgent}`,
                      `Sub Agent ${selectedAgent}`,
                    ]);
                    const playerIDs =
                      createdUsers[selectedAgent]?.map((user) => user.uid) ||
                      [];
                    const filteredData = reportData.filter((row) =>
                      playerIDs.includes(row.playerID)
                    );
                    setFilteredPlayerData(filteredData);
                  }
                }}
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>
        {currentTable === "agents" && (
          <>
            <div className="overflow-x-auto mt-6">
              <h3 className="text-xl font-bold mb-4">Agents</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2 sm:p-3">Agent ID</th>
                    <th className="border p-2 sm:p-3">Agent Name</th>
                    <th className="border p-2 sm:p-3">Balance</th>
                    <th className="border p-2 sm:p-3">D Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {createdAgents.map((agent, index) => (
                    <tr key={index} className="text-center">
                      <td
                        className="border p-2 sm:p-3 cursor-pointer"
                        onClick={() => handleAgentClick(agent.agid)}
                      >
                        {agent.agid}
                      </td>
                      <td className="border p-2 sm:p-3">{agent.agentname}</td>
                      <td className="border p-2 sm:p-3">{agent.balance}</td>
                      <td className="border p-2 sm:p-3">{agent.dbalance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto mt-6">
              <h3 className="text-xl font-bold mb-4">Player</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2 sm:p-3">Player</th>
                    <th className="border p-2 sm:p-3">Total Bet</th>
                    <th className="border p-2 sm:p-3">Player W/L</th>
                    <th className="border p-2 sm:p-3">Agent W/L</th>
                    <th className="border p-2 sm:p-3">Company</th>
                    <th className="border p-2 sm:p-3">Start Date</th>
                    <th className="border p-2 sm:p-3">End Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayerData.map((row, index) => {
                    const totalBet = row.bet; // bet is a number, not an array
                    const totalWin = row.win; // win is a number, not an array
                    const playerWL = totalWin - totalBet;

                    // Determine the text color based on playerWL
                    const wlColor =
                      playerWL < 0 ? "text-red-500" : "text-green-500";

                    // Use Math.abs() to remove the negative sign for calculations
                    const absoluteWL = Math.abs(playerWL);

                    return (
                      <tr key={index} className="text-center">
                        <td
                          className="border p-2 sm:p-3 cursor-pointer hover:text-blue-500"
                          onClick={() => handlePlayerClick(row.playerID)}
                        >
                          {row.playerID}
                        </td>
                        <td className="border p-2 sm:p-3">
                          {Number(totalBet.toFixed(2)).toLocaleString()}
                        </td>
                        <td className={`border p-2 sm:p-3 ${wlColor}`}>
                          {Number(playerWL.toFixed(2)).toLocaleString()}
                        </td>
                        <td className="border p-2 sm:p-3 text-green-500">
                          {Number(
                            (85 / 100) * absoluteWL.toFixed(2)
                          ).toLocaleString()}
                        </td>
                        <td className="border p-2 sm:p-3 text-green-500">
                          {Number(
                            (15 / 100) * absoluteWL.toFixed(2)
                          ).toLocaleString()}
                        </td>
                        <td className="border p-2 sm:p-3">{row.startDate}</td>
                        <td className="border p-2 sm:p-3">{row.endDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {currentTable === "subagents" && (
          <>
            <div className="overflow-x-auto mt-6">
              <h3 className="text-xl font-bold mb-4">Sub Agents</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2 sm:p-3">Agent ID</th>
                    <th className="border p-2 sm:p-3">Agent Name</th>
                    <th className="border p-2 sm:p-3">Balance</th>
                    <th className="border p-2 sm:p-3">D Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {subCreatedAgents[selectedAgent]?.length > 0 ? (
                    subCreatedAgents[selectedAgent].map((agent, index) => (
                      <tr key={index} className="text-center">
                        <td
                          className="border p-2 sm:p-3 cursor-pointer"
                          onClick={() => handleSubAgentClick(agent.agid)}
                        >
                          {agent.agid}
                        </td>
                        <td className="border p-2 sm:p-3">{agent.agentname}</td>
                        <td className="border p-2 sm:p-3">{agent.balance}</td>
                        <td className="border p-2 sm:p-3">{agent.dbalance}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border p-2 sm:p-3 text-center" colSpan="4">
                        No sub agents found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto mt-6">
              <h3 className="text-xl font-bold mb-4">Player</h3>
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border p-2 sm:p-3">Player</th>
                    <th className="border p-2 sm:p-3">Total Bet</th>
                    <th className="border p-2 sm:p-3">Player W/L</th>
                    <th className="border p-2 sm:p-3">Agent W/L</th>
                    <th className="border p-2 sm:p-3">Company</th>
                    <th className="border p-2 sm:p-3">Start Date</th>
                    <th className="border p-2 sm:p-3">End Date</th>
                    {/* <th className="border p-2 sm:p-3">Status</th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayerData.map((row, index) => {
                    const totalBet = row.bet; // bet is a number, not an array
                    const totalWin = row.win; // win is a number, not an array
                    const playerWL = totalWin - totalBet;

                    // Determine the text color based on playerWL
                    const wlColor =
                      playerWL < 0 ? "text-red-500" : "text-green-500";

                    // Use Math.abs() to remove the negative sign for calculations
                    const absoluteWL = Math.abs(playerWL);

                    // Ensure row.totalWin is defined, default to 0 if undefined
                    const rowTotalWin = row.totalWin || 0;

                    return (
                      <tr key={index} className="text-center">
                        <td
                          className="border p-2 sm:p-3 cursor-pointer hover:text-blue-500"
                          onClick={() => handlePlayerClick(row.playerID)}
                        >
                          {row.playerID}
                        </td>
                        <td className="border p-2 sm:p-3">
                          {Number(totalBet.toFixed(2)).toLocaleString()}
                          {/*totalBet.toFixed(2)*/}
                        </td>
                        <td className={`border p-2 sm:p-3 ${wlColor}`}>
                          {Number(playerWL.toFixed(2)).toLocaleString()}
                          {/* {playerWL.toFixed(2)} */}
                        </td>
                        <td className="border p-2 sm:p-3 text-green-500">
                          {Number(
                            (85 / 100) * absoluteWL.toFixed(2)
                          ).toLocaleString()}
                          {/* {(85 / 100) * absoluteWL.toFixed(2)} */}
                        </td>
                        <td className="border p-2 sm:p-3 text-green-500">
                          {Number(
                            (15 / 100) * absoluteWL.toFixed(2)
                          ).toLocaleString()}
                          {/* {(15 / 100) * absoluteWL.toFixed(2)} */}
                        </td>
                        <td className="border p-2 sm:p-3">{row.startDate}</td>
                        <td className="border p-2 sm:p-3">{row.endDate}</td>
                        {/* <td className="border p-2 sm:p-3">
                          {row.status === "C"
                            ? "Complete"
                            : row.status === "I"
                            ? "In Progress"
                            : "Canceled"}
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
        {selectedPlayer && providerData.length > 0 && (
          <div className="overflow-x-auto mt-6">
            <h3 className="text-xl font-bold mb-4">
              Provider Data for Player {selectedPlayer}
            </h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border p-2 sm:p-3">Provider</th>
                  <th className="border p-2 sm:p-3">Total Bet</th>
                  <th className="border p-2 sm:p-3">Player W/L</th>
                  <th className="border p-2 sm:p-3">Agent W/L</th>
                  <th className="border p-2 sm:p-3">Company</th>
                  <th className="border p-2 sm:p-3">Start Date</th>
                  <th className="border p-2 sm:p-3">End Date</th>
                  {/* <th className="border p-2 sm:p-3">Status</th> */}
                </tr>
              </thead>
              <tbody>
                {providerData.map((provider, index) => {
                  // const totalBet = provider.pbet.reduce(
                  //   (sum, round) => sum + round,
                  //   0
                  // );
                  // const totalWin = provider.pwin.reduce(
                  //   (sum, round) => sum + round,
                  //   0
                  // );
                  const playerWL = provider.totalWin - provider.totalBet;

                  // Determine the text color based on playerWL
                  const wlColor =
                    playerWL < 0 ? "text-red-500" : "text-green-500";

                  // Use Math.abs() to remove the negative sign for calculations
                  const absoluteWL = Math.abs(playerWL);
                  return (
                    <tr key={index} className="text-center">
                      <td
                        className="border p-2 sm:p-3 cursor-pointer"
                        onClick={() => handleProviderClick(selectedPlayer)}
                      >
                        {provider.provider}
                      </td>
                      <td className="border p-2 sm:p-3">
                        {Number(provider.totalBet.toFixed(2)).toLocaleString()}
                        {/*provider.totalBet.toFixed(2)*/}
                      </td>
                      <td className="border p-2 sm:p-3 ${wlColor}">
                        {Number(playerWL.toFixed(2)).toLocaleString()}
                      </td>
                      <td className="border p-2 sm:p-3 text-green-500">
                        {Number(
                          (85 / 100) * absoluteWL.toFixed(2)
                        ).toLocaleString()}
                      </td>
                      <td className="border p-2 sm:p-3 text-green-500">
                        {Number(
                          (15 / 100) * absoluteWL.toFixed(2)
                        ).toLocaleString()}
                      </td>
                      <td className="border p-2 sm:p-3">
                        {provider.startDate}
                      </td>
                      <td className="border p-2 sm:p-3">{provider.endDate}</td>
                      {/* <td className="border p-2 sm:p-3">
                        {provider.status === "C"
                          ? "Complete"
                          : provider.status === "I"
                          ? "In Progress"
                          : "Canceled"}
                      </td> */}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* GameLog Modal */}
      {isGameLogModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-4xl overflow-auto">
            <h2 className="text-xl font-bold mb-4">Game Log</h2>
            <GameLog
              playerId={selectedProviderPlayerId} // Auto-fill Player ID as Game ID
            />
            <button
              onClick={() => setIsGameLogModalOpen(false)}
              className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WinLoseReport;
