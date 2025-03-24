import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from 'crypto';


dotenv.config();
const JWT = process.env.JWT_KEY;

export const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Bearer token

  if (!token) {
    console.log("No token provided.");
    return res.status(401).json({ message: "Token is missing." });
  }

  jwt.verify(token, JWT, (err, decoded) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.status(403).json({ message: "Invalid or expired token." });
    }

    req.agent = decoded; // Attach the decoded user info to the request object
    next();
  });
};


// Middleware to process the token through a pipeline
export const tokenPipeline = (req, res, next) => {
  try {
    // Check if the token exists
    if (!req.body.token) {
      return res
        .status(400)
        .json({ error: "Token is missing from the request body" });
    }

    // Decode the token if it's JWT and extract the user ID
    const token = req.body.token;
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.u) {
      // Handle cases where the token is invalid or does not contain a 'u' field
      return res.status(400).json({ error: "Invalid or malformed token" });
    }

    // Extract the user ID from the token
    const userId = decoded.u;

    // Generate a new token format
    const pipelinePart = crypto.randomBytes(6).toString("hex");
    req.body.token = `${userId}-${pipelinePart}`; // Adjusted token

    console.log("Token processed through pipeline:", req.body.token);

    // Pass the request to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Error in token pipeline:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const checkAdminAgentRole = (req, res, next) => {
  const { arole } = req.agent;

  // Check if the user is an Admin or Agent
  if (arole !== "Admin" && arole !== "Agent") {
    return res
      .status(403)
      .json({ message: "Access restricted to Admin and Agent only." });
  }

  next(); // Continue to the next handler (checkAndgetAD)
};

// export const checkAdminAgentRole = (req, res, next) => {
//   if (req.user.arole !== "Admin" && req.user.arole !== "Agent") {
//     return res.status(403).json({ message: "Access denied" });
//   }
//   next();
// };
