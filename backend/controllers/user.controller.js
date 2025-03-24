import { connectToDatabase } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // Import the 'crypto' module
import axios from "axios";

const secureLogin = process.env.PRAGMATIC_PROVIDER_ID; // Ensure correct provider ID
const secretKey = process.env.PRAGMATIC_API_KEY; // Ensure correct API key

// Middleware to get user IP
const getClientIp = (req) => {
  if (!req) return "Unknown"; // Handle undefined request
  let ip =
    req.headers?.["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "Unknown";
  return ip.split(",")[0].trim(); // Handles multiple IPs in 'x-forwarded-for'
};

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

export const userRegister = async (req, res) => {
  const { uid, username, password, currency, balance, active, agentreferral } =
    req.body;

  const db = await connectToDatabase();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if the user already exists
    const [rows] = await connection.query("SELECT * FROM users WHERE uid = ?", [
      uid,
    ]);
    if (rows.length > 0) {
      await connection.rollback();
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash the password using bcrypt (no need to manually add salt)
    const hashPassword = await bcrypt.hash(password, 10);

    let referralAgentBalance = 0;
    let referralAgentRole = "";
    let referralAgentId = 0;

    // Check if the referral agent exists and their role
    if (agentreferral) {
      const [referralAgent] = await connection.query(
        "SELECT id, arole, balance FROM agents WHERE agid = ?",
        [agentreferral]
      );

      if (referralAgent.length > 0) {
        referralAgentRole = referralAgent[0].arole;
        referralAgentBalance = parseFloat(referralAgent[0].balance);
        referralAgentId = referralAgent[0].id;
        const userBalance = parseFloat(balance);

        // Deduct balance only if the referral agent is not an Admin
        if (referralAgentRole !== "Admin") {
          if (referralAgentBalance < userBalance) {
            await connection.rollback();
            return res.status(400).json({
              message: "Insufficient balance in the referral agent's account.",
            });
          }

          // Deduct the balance from the referral agent
          await connection.query(
            "UPDATE agents SET balance = balance - ? WHERE agid = ?",
            [userBalance, agentreferral]
          );
        }
      }
    }

    // Insert the new user into the database
    await connection.query(
      "INSERT INTO users (uid, currency, balance, username, password, active, agentreferral) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [uid, currency, balance, username, hashPassword, active, agentreferral]
    );

    // Insert transaction record for the new user creation
    const agentIP = getClientIp(req); // Get the client IP address
    const transactionDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await connection.query(
      "INSERT INTO transactions (agent_id, agent_id_fk, user_id, amount, beforeamount, recipient_agent_id, type, deposit, withdraw, date, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        agentreferral, // Sender agent (referral agent)
        referralAgentId,
        uid, // Recipient user (new user)
        balance, // Amount transferred
        0.0, // Balance before the transaction
        "Null", // Recipient agent ID (not applicable here)
        "Deposit", // Transaction type
        balance, // Deposit amount (balance added to the new user)
        0.0, // Withdraw amount (balance deducted from the referral agent)
        transactionDate, // Transaction date
        agentIP, // IP address
      ]
    );

    await connection.commit();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Internal Server Error" });
  } finally {
    connection.release();
  }
};

export const userLogin = async (req, res) => {
  const { uid, password } = req.body;
  if (!uid || !password) {
    return res.status(400).json({ message: "Missing required parameters" });
  }

  try {
    const db = await connectToDatabase();

    // Get user details
    const [rows] = await db.query("SELECT * FROM users WHERE uid = ?", [uid]);
    console.log("User fetched from database:", rows);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, rows[0].password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      u: rows[0].uid,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3 * 60 * 60, // 3 hours expiry
    };

    console.log("JWT payload:", payload);

    const token = jwt.sign(payload, process.env.JWT_KEY, {
      algorithm: "HS256",
    });

    console.log("Generated token:", token);

    // Get user's IP address and extract IPv4 if needed
    let userIp =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress || req.ip;
    if (userIp.startsWith("::ffff:")) {
      userIp = userIp.replace("::ffff:", ""); // Extract IPv4 from IPv6-mapped address
    }

    // Update user's token and last login IP in the database
    await db.query(
      "UPDATE users SET token = ?, last_login_ip = ? WHERE uid = ?",
      [token, userIp, uid]
    );

    res.status(200).json({ token, userId: rows[0].uid });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [users] = await db.query("SELECT * FROM users");
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const checkUser = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE uid = ?", [
      req.userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(201).json({ user: rows[0] });
  } catch (err) {
    console.error("Error fetching user data:", err.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const userLogout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Check if UID is unique
export const checkUID = async (req, res) => {
  const { uid } = req.params;

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE uid = ?", [uid]);

    if (rows.length > 0) {
      return res.json({ isUnique: false }); // UID already exists
    }

    res.json({ isUnique: true }); // UID is unique
  } catch (err) {
    console.error("Error checking UID uniqueness:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update User Password
export const updateUserPassword = async (req, res) => {
  const { userId, newPassword } = req.body; // userId is passed in the request body

  try {
    const db = await connectToDatabase();

    console.log("Received userId:", userId); // Log the userId

    // Fetch user from the database
    const [user] = await db.query("SELECT * FROM users WHERE uid = ?", [
      userId,
    ]);

    console.log("User fetched from database:", user); // Log the fetched user

    if (!user || user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await db.query("UPDATE users SET password = ? WHERE uid = ?", [
      hashedPassword,
      userId,
    ]);

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error updating password:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Update User Active Status
export const updateUserActiveStatus = async (req, res) => {
  const { userId, active } = req.body; // userId and active status (true/false)

  try {
    const db = await connectToDatabase();

    // Update the user's active status in the database
    await db.query("UPDATE users SET active = ? WHERE uid = ?", [
      active,
      userId,
    ]);

    return res
      .status(200)
      .json({ message: "User active status updated successfully." });
  } catch (err) {
    console.error("Error updating user active status:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const countUser = async (req, res) => {
  try {
    const db = await connectToDatabase();

    const [agents] = await db.query("SELECT agid FROM agents");
    let userCounts = {};

    for (const agent of agents) {
      const [result] = await db.query(
        "SELECT COUNT(*) AS count FROM users WHERE agentreferral = ?",
        [agent.agid]
      );
      userCounts[agent.agid] = result[0].count;
    }

    res.status(200).json(userCounts);
  } catch (err) {
    console.error("Error fetching user counts:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
