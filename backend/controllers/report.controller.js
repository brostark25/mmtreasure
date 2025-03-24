import { connectToDatabase } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import axios from "axios";
import csvParser from "csv-parser";
import dotenv from "dotenv";
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import { fileURLToPath } from "url";
import { fetchAllGameRounds, fetchGameRoundsFromDB } from "./gameRoundsService.js";

dotenv.config();

// Get the current file path for ES modules
const __filename = fileURLToPath(import.meta.url);

const secureLogin = process.env.PRAGMATIC_PROVIDER_ID; // Ensure correct provider ID
const secretKey = process.env.PRAGMATIC_API_KEY; // Ensure correct API key

// Function to calculate the expected hash from the parameters
const calculateHash = (params, secretKey) => {
  // Remove hash parameter if it exists
  delete params["hash"];

  // Sort parameters by keys alphabetically
  const sortedKeys = Object.keys(params).sort();

  // Create the query string
  const paramString = sortedKeys
    .filter((key) => params[key] !== null && params[key] !== "")
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  // Append the secret key
  const stringToHash = paramString + secretKey;

  console.log("String to Hash:", stringToHash); // Debugging purposes

  // Return the MD5 hash
  return crypto.createHash("md5").update(stringToHash).digest("hex");
};

export const getPlayedGames = async (req, res) => {
  //const { secureLogin, secretKey } = process.env;

  if (!secureLogin || !secretKey) {
    console.error("Missing secureLogin or secretKey in .env");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  // Extract request parameters
  const { playerId, datePlayed, timeZone } = req.body;

  console.log("Get Played Games Request:", req.body);

  if (!playerId || !datePlayed || !timeZone) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  // Request payload
  const params = {
    secureLogin,
    playerId,
    datePlayed,
    timeZone,
  };

  // Calculate hash
  const hash = calculateHash(params, secretKey);
  console.log("Get Played Games Hash:", hash);

  try {
    const endpoint = `${process.env.PRAGMATIC_GAME_HISTRY_ENDPOINT}/GetPlayedGames/`;
    console.log("Making request to:", endpoint); // Debugging the endpoint URL

    // Make the request to the Casino Game API
    const response = await axios.post(
      endpoint,
      new URLSearchParams({
        ...params,
        hash,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (response.data.error !== "0") {
      console.error("API Error:", response.data.description || "Unknown error");
      return res.status(400).json({ message: response.data.description });
    }

    // Respond with the list of games
    res.json({
      error: response.data.error,
      description: response.data.description,
      games: response.data.games || [],
    });
  } catch (error) {
    console.error("Error fetching played games:", error.message);
    res.status(500).json({ message: "Failed to fetch played games" });
  }
};


export const getGameRoundsHist = async (req, res) => {
  if (!req.body.datePlayed) {
    return res.status(400).json({ error: "Missing required parameters: datePlayed" });
  }

  req.body.datePlayed = String(req.body.datePlayed).trim().replace(/[\r\n]/g, "");

  const { playerId, datePlayed, timeZone, gameId, hour } = req.body;
  const secureLogin = process.env.PRAGMATIC_PROVIDER_ID;
  const secretKey = process.env.PRAGMATIC_API_KEY;

  console.log("Game Rounds Request:", req.body);

  if (!playerId || !datePlayed || !timeZone || !gameId) {
    return res.status(400).json({ error: "Missing required parameters" });
  }

  const hoursToQuery = hour !== undefined ? [hour.toString()] : Array.from({ length: 24 }, (_, i) => i.toString());
  const url = `${process.env.PRAGMATIC_GAME_HISTRY_ENDPOINT}/GetGameRounds/`;

  let allRounds = [];
  
  try {
    for (const h of hoursToQuery) {
      const params = {
        secureLogin,
        playerId,
        datePlayed,
        timeZone,
        gameId,
        hour: h,
      };

      const hash = calculateHash(params, secretKey);
      params.hash = hash;

      console.log(`Fetching data for hour: ${h}, Generated Hash: ${hash}`);

      const response = await axios.post(
        url,
        new URLSearchParams(params).toString(),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      if (response.data.error !== "0") {
        console.warn(`Error for hour ${h}:`, response.data);
        continue;
      }

      if (Array.isArray(response.data.rounds)) {
        allRounds = allRounds.concat(response.data.rounds);
      }
    }

    res.status(200).json({ rounds: allRounds });
  } catch (error) {
    console.error("Error fetching game rounds:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch game rounds" });
  }
};




export const getGameRounds = async (req, res) => {
  const { login, password, timepointFrom, timepointTo } = req.query;

  if (!login || !password) {
    return res.status(400).json({ message: "login and password are required" });
  }

  const now = new Date();
  const startTime = timepointFrom
    ? parseInt(timepointFrom, 10)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();

  const endTime = timepointTo
    ? parseInt(timepointTo, 10)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  if (isNaN(startTime) || isNaN(endTime) || startTime > endTime) {
    return res.status(400).json({ message: "Invalid time range" });
  }

  console.log("Fetching data between:", new Date(startTime), "and", new Date(endTime));

  try {
    // Fetch data from the database
    const results = await fetchAllGameRounds(login, password, startTime, endTime);

    return res.status(200).json({
      starttimepoint: startTime,
      stoptimepoint: endTime,
      data: results,
    });
  } catch (error) {
    console.error("Error during game round processing:", error.message);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};




export const getGameRoundsFromDB = async (req, res) => {
  const { timepointFrom, timepointTo } = req.query;

  const now = new Date();
  const startTime = timepointFrom
    ? parseInt(timepointFrom, 10)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();

  const endTime = timepointTo
    ? parseInt(timepointTo, 10)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  if (isNaN(startTime) || isNaN(endTime) || startTime > endTime) {
    return res.status(400).json({ message: "Invalid time range" });
  }

  console.log("Fetching data from DB between:", new Date(startTime), "and", new Date(endTime));

  try {
    const results = await fetchGameRoundsFromDB(startTime, endTime);

    return res.status(200).json({
      starttimepoint: startTime,
      stoptimepoint: endTime,
      data: results,
    });
  } catch (error) {
    console.error("Error during game round processing:", error.message);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};




{/* export const getGameRounds = async (req, res) => {
  const { login, password, timepointFrom, timepointTo } = req.query;

  if (!login || !password) {
    return res.status(400).json({ message: "login and password are required" });
  }

  // Create a single Date object for the current time
  const now = new Date();

  // Set startTime to the beginning of the current day
  const startTime = timepointFrom
    ? parseInt(timepointFrom, 10)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime(); // Beginning of the current day

  // Set endTime to the end of the current day
  const endTime = timepointTo
    ? parseInt(timepointTo, 10)
    : new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime(); // End of the current day

  if (isNaN(startTime) || isNaN(endTime) || startTime > endTime) {
    return res.status(400).json({ message: "Invalid time range" });
  }

  console.log("Fetching data between:", new Date(startTime), "and", new Date(endTime));

  try {
    const results = await fetchAllGameRounds(login, password, startTime, endTime);

    return res.status(200).json({
      starttimepoint: startTime,
      stoptimepoint: endTime,
      data: results,
    });
  } catch (error) {
    console.error("Error during game round processing:", error.message);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}; */}







{/*export const getGameRounds = async (req, res) => {
  const { login, password, timepointFrom, timepointTo } = req.query;

  if (!login || !password) {
    return res.status(400).json({ message: "login and password are required" });
  }
  
  // Create a single Date object for the current time
  const now = new Date();
  
  const startTime = timepointFrom
  ? parseInt(timepointFrom, 10)
  : new Date(now).setUTCHours(0, 0, 0, 0); // Beginning of the current day in UTC

  const endTime = timepointTo
    ? parseInt(timepointTo, 10)
    : new Date(now).setUTCHours(23, 59, 59, 999); // End of the current day in UTC

  //const startTime = timepointFrom ? parseInt(timepointFrom, 10) : new Date().setHours(0, 0, 0, 0); // Beginning of the current day
  //const endTime = timepointTo ? parseInt(timepointTo, 10) : new Date().setHours(23, 59, 59, 999); // Current time + 15 minutes
  if (isNaN(startTime) || isNaN(endTime) || startTime > endTime) {
    return res.status(400).json({ message: "Invalid time range" });
  }

  console.log("Fetching data between:", new Date(startTime), "and", new Date(endTime));

  try {
    const results = await fetchAllGameRounds(login, password, startTime, endTime);

    return res.status(200).json({
      starttimepoint: startTime,
      stoptimepoint: endTime,
      data: results,
    });
  } catch (error) {
    console.error("Error during game round processing:", error.message);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
};*/}

{/*export const getGameRounds = async (req, res) => {
  const { login, password, timepointFrom, timepointTo } = req.query;

  if (!login || !password) {
    return res.status(400).json({ message: "login and password are required" });
  }

  const startTime = timepointFrom ? parseInt(timepointFrom, 10) : Date.now() - 10 * 60 * 1000;
  const endTime = timepointTo ? parseInt(timepointTo, 10) : new Date().setHours(23, 59, 59, 999);

  if (isNaN(startTime) || isNaN(endTime) || startTime > endTime) {
    return res.status(400).json({ message: "Invalid time range" });
  }

  console.log("Fetching data between:", new Date(startTime), "and", new Date(endTime));

  const fetchGameRounds = async (timepoint, retries = 3, delay = 1000) => {
    try {
      const url = `https://api.prerelease-env.biz/IntegrationService/v3/DataFeeds/gamerounds/?login=${encodeURIComponent(
        login
      )}&password=${encodeURIComponent(password)}&timepoint=${timepoint}`;

      console.log(`Fetching URL: ${url}`);

      const response = await axios.get(url, { responseType: "stream" });

      const results = [];
      return new Promise((resolve, reject) => {
        response.data
          .pipe(csvParser())
          .on("data", (row) => {
            if (row["_1"] && row["_1"] !== "extPlayerID") {
              results.push(row);
            }
          })
          .on("end", () => {
            console.log(`Data fetched for timepoint=${timepoint}, Rows: ${results.length}`);
            resolve(results);
          })
          .on("error", (error) => {
            console.error("Error parsing CSV:", error.message);
            reject(error);
          });
      });
    } catch (error) {
      console.error(`API Request Failed for timepoint=${timepoint}:`, error.message);

      if (retries > 0) {
        console.log(`Retrying in ${delay / 1000} seconds...`);
        await new Promise((res) => setTimeout(res, delay));
        return fetchGameRounds(timepoint, retries - 1, delay * 2);
      }

      return [];
    }
  };

  try {
    const interval = 10 * 60 * 1000;
    const timepoints = [];
    for (let timepoint = startTime; timepoint <= endTime; timepoint += interval) {
      timepoints.push(timepoint);
    }

    const results = [];
    for (const timepoint of timepoints) {
      const data = await fetchGameRounds(timepoint);
      results.push(...data);
    }

    return res.status(200).json({
      starttimepoint: startTime,
      stoptimepoint: endTime,
      data: results,
    });
  } catch (error) {
    console.error("Error during game round processing:", error.message);
    return res.status(500).json({ message: "An unexpected error occurred" });
  }
}; */}




export const WinLoseRp = (req, res) => {
  try {
    const { dateFrom, dateTo, categories } = req.body;

    // Validate inputs
    if (!dateFrom || !dateTo) {
      return res
        .status(400)
        .json({ message: "dateFrom and dateTo are required." });
    }

    // Ensure categories is an array
    const categoryCondition =
      Array.isArray(categories) && categories.length > 0
        ? `AND category IN (${categories.map((c) => `'${c}'`).join(",")})`
        : "";

    const query = `
      SELECT * FROM transactions
      WHERE date >= ? AND date <= ? ${categoryCondition}
    `;

    // Execute the database query
    connectToDatabase().query(query, [dateFrom, dateTo], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("Error in WinLoseRp:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const shanReport = async (req, res) => {
  const { playerId, gameId, result, amount, timestamp } = req.body;

  // Validate required fields
  if (!playerId || !gameId || !result || !amount || !timestamp) {
    return res.status(400).json({
      status: "error",
      message:
        "Missing required fields. Please include playerId, gameId, result, amount, and timestamp.",
    });
  }

  try {
    // Log the report data (replace this with database logic as needed)
    console.log("Game Report Received:", {
      playerId,
      gameId,
      result,
      amount,
      timestamp,
    });

    // Respond with success
    res.status(200).json({
      status: "success",
      message: "Report received successfully",
    });
  } catch (error) {
    console.error("Error processing report:", error);

    // Respond with error
    res.status(500).json({
      status: "error",
      message: "An error occurred while processing the report.",
    });
  }
};

export const createdAgents = async (req, res) => {
  const { agentID } = req.query;

  if (!agentID) {
    return res.status(400).json({ error: "Agent ID is required" });
  }

  try {
    const db = await connectToDatabase();
    const query = "SELECT agid, agentname FROM agents WHERE agentreferral = ?";
    const [agents] = await db.query(query, [agentID]);

    return res.status(200).json({ agents });
  } catch (error) {
    console.error("Error fetching created agents:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export const createdUsers = async (req, res) => {
  const { agentID } = req.query;

  if (!agentID) {
    return res.status(400).json({ error: "Agent ID is required" });
  }

  try {
    const db = await connectToDatabase();
    const query = "SELECT uid, username FROM users WHERE agentreferral = ?";
    const [users] = await db.query(query, [agentID]);

    return res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users for agent:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


export const getCreatedAgentsAndUsers = async (req, res) => {
  const { agentID } = req.query;

  if (!agentID) {
    return res.status(400).json({ error: "Agent ID is required" });
  }

  try {
    const db = await connectToDatabase();

    // Fetch agents created by the specified agent
    const agentsQuery = "SELECT agid, agentname, balance, dbalance FROM agents WHERE agentreferral = ?";
    const [agents] = await db.query(agentsQuery, [agentID]);

    // Fetch users created by the agents
    const agentIDs = agents.map(agent => agent.agid);
    let users = [];

    if (agentID.length > 0) {
      const usersQuery = "SELECT uid, username, balance FROM users WHERE agentreferral IN (?)";
      [users] = await db.query(usersQuery, [agentID]);
    }

    return res.status(200).json({ agents, users });
  } catch (error) {
    console.error("Error fetching created agents and users:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};