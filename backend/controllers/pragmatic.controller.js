import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const secureLogin = process.env.PRAGMATIC_PROVIDER_ID; // Ensure correct provider ID
const secretKey = process.env.PRAGMATIC_API_KEY; // Ensure correct API key

// Helper function to calculate hash
const calculateHash = (params, secretKey) => {
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return crypto
    .createHash("md5")
    .update(`${queryString}${secretKey}`)
    .digest("hex");
};

export const getCasinoGames = async (req, res) => {
  if (!secureLogin || !secretKey) {
    console.error("Missing secureLogin or secretKey in .env");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  // Request payload
  const params = {
    secureLogin,
  };

  // Calculate hash
  const hash = calculateHash(params, secretKey);
  console.log("Get Casino Games Hash : ",hash);

  try {
    // Make the request to the Pragmatic Play API
    const response = await axios.post(
      `${process.env.PRAGMATIC_API_ENDPOINT}/getCasinoGames/`,
      new URLSearchParams({
        secureLogin,
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

    // console.log("Games fetched successfully:", response.data);
    // console.log("Games fetched successfully");
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching casino games:", error.message);
    res.status(500).json({ message: "Failed to fetch casino games" });
  }
}; 


export const getCasinoLobbyGames = async (req, res) => {
  //const secureLogin = process.env.PRAGMATIC_PROVIDER_ID;
  //const secretKey = process.env.PRAGMATIC_API_KEY; 

  if (!secureLogin || !secretKey) {
    console.error("Missing secureLogin or secretKey in .env");
    return res.status(500).json({ message: "Server misconfiguration" });
  }

  // Request parameters (adjust according to API requirements)
  const params = {
    secureLogin,
    categories: "all", // Make sure this is the correct category parameter
    country: "US", // If applicable, you can adjust this according to the API documentation
  };

  // Calculate hash (ensure the hash is calculated correctly)
  const hash = calculateHash(params, secretKey);
  //console.log(`Calculated Hash Casino Lobby: ${hash}`);
  console.log("Calculated Hash Casino Lobby : " , hash);

  try {
    // Making the POST request with application/x-www-form-urlencoded
    const response = await axios.post(
      `${process.env.PRAGMATIC_API_ENDPOINT}/getLobbyGames/`,
      new URLSearchParams({
        secureLogin,
        categories: "all", // Include other required parameters
        country: "US", // Include country if required by the API
        hash, // Pass the calculated hash here
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache", // Include Cache-Control header if needed
        },
      }
    );

    // Log the full response for debugging
    console.log("API Response:", response.data);

    if (response.data.error !== "0") {
      console.error("API Error:", response.data.description || "Unknown error");
      return res.status(400).json({ message: response.data.description });
    }

    // Send the games data back to the client
    res.json({ games: response.data.games || [] });
  } catch (error) {
    console.error("Error fetching all games:", error.message);
    res.status(500).json({ message: "Failed to fetch all games" });
  }
};


export const launchGame = async (req, res) => {
  // Set default values
  req.body.jurisdiction = 99;
  req.body.promo = "y";
  req.body.lobbyUrl = "https://burma03.net/ppslotgames"; // Replace with your Casino Operator's default lobby URL.

  try {
    // Extract data from the request body
    const {
      externalPlayerId,
      symbol,
      language,
      token,
      jurisdiction,
      promo,
      lobbyUrl
    } = req.body;

    // Validate required parameters
    if (!externalPlayerId || !symbol || !language || !token) {
      return res.status(400).json({
        error: "Missing required parameters: externalPlayerId, symbol, language, token.",
      });
    }


    // Ensure secureLogin and secretKey are present
    const secureLogin = process.env.PRAGMATIC_PROVIDER_ID;
    const secretKey = process.env.PRAGMATIC_API_KEY;
    if (!secureLogin || !secretKey) {
      console.error("Missing secureLogin or secretKey in environment variables.");
      return res.status(500).json({ error: "Server misconfiguration." });
    }

    // Prepare parameters for the hash calculation
    const params = {
      externalPlayerId,
      language,
      secureLogin,
      symbol,
      token,
      lobbyUrl,
    };

    // Calculate the hash
    const hash = calculateHash(params, secretKey);

    // Log the hash for debugging
    console.log("Launch Game Hash:", hash);

    // Add the hash to the request data
    const requestData = {
      ...params,
      hash,
    };

    // Make the API request
    const response = await axios.post(
      process.env.PRAGMATIC_GAME_LAUNCH_ENDPOINT,
      new URLSearchParams(requestData).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Handle the API response
    res.status(response.status).json(response.data);
    console.log(response.data);
  } catch (error) {
    console.error("Error launching game:", error.message);
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    res.status(500).json({ error: "Internal server error." });
  }
};

export const openHistoryExt = async (req, res) => {
  // Extract playerId, gameId, and roundId from the request body
  const { playerId, gameId, roundId } = req.body;

  // Check if required parameters are missing
  if (!secureLogin || !playerId || !gameId || !roundId) {
    console.error("Missing one of the required request parameters");
    return res.status(400).json({ message: "Missing required parameters" });
  }

  // Prepare the parameters for the hash calculation
  const params = {
    secureLogin,
    playerId,
    gameId,
    roundId,
  };

  // Calculate the hash
  const hash = calculateHash(params, secretKey);
  console.log("Get Open History Ext Hash : ", hash);

  try {
    // Make the API request to Pragmatic's OpenHistoryExtended endpoint
    const response = await axios.post(
      `${process.env.PRAGMATIC_GAME_HISTRY_ENDPOINT}/OpenHistoryExtended/`,
      new URLSearchParams({
        secureLogin,
        playerId,
        gameId,
        roundId,
        hash,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    // Check if the API returned an error
    if (response.data.error !== "0") {
      console.error("API Error:", response.data.description || "Unknown Error");
      return res.status(400).json({ message: response.data.description });
    }

    // Return the API response
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching open history extended : ", error.message);
    res.status(500).json({ message: "Failed to fetch open history extended" });
  }
};
