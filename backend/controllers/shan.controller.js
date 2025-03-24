import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const registerPlayer = async (req, res) => {
  try {
    // Extract data from the request body
    const { domain, game, level, id, nickname, balance, profile } = req.body;

    // Validate required parameters
    if (!domain || !game || !id || !nickname || balance == null) {
      return res.status(400).json({
        error:
          "Missing required parameters: domain, game, id, nickname, balance.",
      });
    }

    // Ensure the registration endpoint is present
    const registrationEndpoint = "https://developer.casino909.com/register.php";
    console.log("registrationEndpoint:", registrationEndpoint);
    if (!registrationEndpoint) {
      console.error(
        "Missing SKM_GAME_PLAYER_REGISTRATION in environment variables."
      );
      return res.status(500).json({ error: "Server misconfiguration." });
    }

    // Prepare the JSON payload for registration
    const requestData = {
      domain,
      game,
      level: level || 0, // Default level to 0 if not provided
      id,
      nickname,
      balance,
      profile: profile || "0", // Default profile to "0" if not provided
    };

    // Send the POST request to the registration endpoint
    const response = await axios.post(registrationEndpoint, requestData, {
      headers: { "Content-Type": "application/json" },
    });

    // Handle the response from the API
    const responseData = response.data;
    if (responseData.status === "ok") {
      // Return the game URL to the client
      res.status(200).json({
        message: "Player registered successfully.",
        gameUrl: responseData.url,
      });
    } else {
      // Return an error response if the status is not "ok"
      res.status(400).json({
        error: "Player registration failed.",
        details: responseData,
      });
    }
  } catch (error) {
    console.error("Error registering player:", error.message);

    // Return the error response from the API if available
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    // Handle unexpected errors
    res.status(500).json({ error: "Internal server error." });
  }
};
