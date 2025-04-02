import { connectToDatabase } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  validateAgentExists,
  updateAgentBalance,
  updateAgentBalanceAndDbalance,
} from "./agent.service.js";
import { validateUserExists, updateUserBalance } from "./user.service.js";

export const agentRegister = async (req, res) => {
  const {
    agid,
    agentname,
    telephone,
    agentreferral,
    balance,
    dbalance,
    arole,
    password,
    active = 1, // Default to active (1) if not provided
    allPT, // All PT value
    gamesPT, // Games PT object
  } = req.body;

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if the agid or agentname already exists
    const [existingAgent] = await connection.execute(
      "SELECT * FROM agents WHERE agid = ? OR agentname = ?",
      [agid, agentname]
    );

    if (existingAgent.length > 0) {
      await connection.rollback();
      return res
        .status(409)
        .json({ message: "Agent ID or name already exists" });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Validate and set dbalance
    let validatedDbalance = parseFloat(dbalance); // Convert dbalance to a number
    if (isNaN(validatedDbalance)) {
      validatedDbalance = 0; // Set to 0 if dbalance is not a valid number
    }

    let referralAgentBalance = 0;
    let referralAgentRole = "";

    // Check if the logged-in agent (referral) exists
    if (agentreferral) {
      const [referralAgent] = await connection.execute(
        "SELECT arole, balance, dbalance FROM agents WHERE agid = ?",
        [agentreferral]
      );

      if (referralAgent.length > 0) {
        referralAgentRole = referralAgent[0].arole;
        referralAgentBalance = parseFloat(referralAgent[0].balance);
      }
    }

    // Only proceed if the referral agent is an Admin
    if (referralAgentRole === "Agent") {
      const initialBalance = parseFloat(balance);
      if (referralAgentBalance < initialBalance) {
        await connection.rollback();
        return res.status(400).json({
          message: "Insufficient balance in the referral agent's account.",
        });
      }

      // Deduct the balance from the referral agent (Admin)
      await connection.execute(
        "UPDATE agents SET balance = balance - ? WHERE agid = ?",
        [initialBalance, agentreferral]
      );
    }

    // Convert gamesPT object to a JSON string for storage
    const gamesPTString = JSON.stringify(gamesPT);

    // Insert new agent into the database
    await connection.execute(
      "INSERT INTO agents (agid, agentname, telephone, agentreferral, balance, dbalance, arole, password, active, allPT, gamesPT) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        agid,
        agentname,
        telephone,
        agentreferral,
        balance, // Initial balance for the new agent
        validatedDbalance,
        arole,
        hashedPassword,
        active, // Include the active field
        allPT, // All PT value
        gamesPTString, // Games PT as a JSON string
      ]
    );

    // Update the referral agent's dbalance with the same amount as the new agent's balance
    if (agentreferral) {
      await connection.execute(
        "UPDATE agents SET dbalance = dbalance + ? WHERE agid = ?",
        [balance, agentreferral]
      );
    }

    // Insert transaction record for the new agent creation
    const agentIP = getClientIp(req); // Get the client IP address
    const transactionDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await connection.execute(
      "INSERT INTO transactions (agent_id, recipient_agent_id, amount, beforeamount, user_id, type, deposit, withdraw, date, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        agentreferral, // Sender agent (referral agent)
        agid, // Recipient agent (new agent)
        balance, // Amount transferred
        0.0, // Balance before the transaction
        "Null", // User ID (not applicable here)
        "Deposit", // Transaction type
        balance, // Deposit amount (balance added to the new agent)
        0.0, // Withdraw amount (balance deducted from the referral agent)
        transactionDate, // Transaction date
        agentIP, // IP address
      ]
    );

    await connection.commit();
    res.status(201).json({ message: "Agent registered successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error registering agent:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    connection.release();
  }
};

export const agentLogin = async (req, res) => {
  const { agid, password } = req.body;

  // Check if agid and password are provided in the request
  if (!agid || !password) {
    return res
      .status(400)
      .json({ message: "Agent ID and password are required." });
  }

  try {
    const db = await connectToDatabase();

    // Fetch agent from the database
    const [agent] = await db.query("SELECT * FROM agents WHERE agid = ?", [
      agid,
    ]);

    // Check if agent exists
    if (!agent || agent.length === 0) {
      return res.status(401).json({ message: "Invalid Agent ID or password." });
    }

    // Ensure password is not undefined or empty
    if (!agent[0].password) {
      return res
        .status(500)
        .json({ message: "Password data missing for this agent." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, agent[0].password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Agent ID or password." });
    }

    // Verify role - Only Admin and Agent roles are allowed
    const agentRole = agent[0].arole;
    if (agentRole !== "Admin" && agentRole !== "Agent") {
      return res
        .status(403)
        .json({ message: "Access restricted to Admin and Agent only." });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: agent[0].id, agid: agent[0].agid, arole: agentRole },
      process.env.JWT_KEY,
      { expiresIn: "3h" }
    );

    // Respond with login success and JWT token
    res.status(201).json({
      message: "Login successful.",
      token,
      agent: {
        agid: agent[0].agid,
        agentname: agent[0].agentname,
        arole: agentRole,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Add this to your agent.controller.js
export const updateAgent = async (req, res) => {
  const { agid } = req.params;
  const { agentname, telephone, active, allPT, gamesPT } = req.body;

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Convert gamesPT object to JSON string if it exists
    const gamesPTString = gamesPT ? JSON.stringify(gamesPT) : null;

    // Update agent information
    await connection.execute(
      `UPDATE agents SET 
        agentname = ?,
        telephone = ?,
        active = ?,
        allPT = ?,
        gamesPT = ?
      WHERE agid = ?`,
      [agentname, telephone, active, allPT, gamesPTString, agid]
    );

    await connection.commit();
    res.status(200).json({ message: "Agent updated successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating agent:", err);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    connection.release();
  }
};

export const agentLogout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Optional: Implement token blacklisting here if required
    // e.g., store the token in a blacklist database and check it during authentication

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Check if AGID is unique
export const checkAGID = async (req, res) => {
  const { agid } = req.params;

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM agents WHERE agid = ?", [
      agid,
    ]);

    if (rows.length > 0) {
      return res.json({ isUnique: false }); // AGID already exists
    }

    res.json({ isUnique: true }); // AGID is unique
  } catch (err) {
    console.error("Error checking AGID uniqueness:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Check and Get Agent Data
export const checkAndgetAD = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const { id } = req.agent; // Corrected line to access the agent's ID from decoded token

    // Fetch agent details from the database
    const [agent] = await db.query("SELECT * FROM agents WHERE id = ?", [id]);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ message: "Agent not found." });
    }

    res.status(200).json({
      message: "Agent data retrieved successfully.",
      agent: {
        id: agent[0].id,
        agid: agent[0].agid,
        agentname: agent[0].agentname,
        arole: agent[0].arole,
        balance: agent[0].balance,
        dbalance: agent[0].dbalance,
        pt: agent[0].pt,
      },
    });
  } catch (err) {
    console.error("Error retrieving agent data:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Get All Agents Data
export const getAllAgent = async (req, res) => {
  try {
    const db = await connectToDatabase();
    const [agents] = await db.query("SELECT * FROM agents");
    if (!agents || agents.length === 0) {
      return res.status(404).json({ message: "No agents found" });
    }
    return res.status(200).json({ agents });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};
// Update Agent Password
export const updateAgentPassword = async (req, res) => {
  const { agid, newPassword } = req.body;

  try {
    const db = await connectToDatabase();

    // Fetch agent from the database
    const [agent] = await db.query("SELECT * FROM agents WHERE agid = ?", [
      agid,
    ]);

    if (!agent || agent.length === 0) {
      return res.status(404).json({ message: "Agent not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the agent's password in the database
    await db.query("UPDATE agents SET password = ? WHERE agid = ?", [
      hashedPassword,
      agid,
    ]);

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};

// Update Agent Active Status
export const updateAgentActiveStatus = async (req, res) => {
  const { agid, active } = req.body; // agid and active status (true/false)

  try {
    const db = await connectToDatabase();

    // Update the agent's active status in the database
    await db.query("UPDATE agents SET active = ? WHERE agid = ?", [
      active,
      agid,
    ]);

    return res
      .status(200)
      .json({ message: "Agent active status updated successfully." });
  } catch (err) {
    console.error("Error updating agent active status:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Middleware to get user IP
const getClientIp = (req) => {
  if (!req) return "Unknown"; // Handle undefined request
  let ip =
    req.headers?.["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    "Unknown";
  return ip.split(",")[0].trim(); // Handles multiple IPs in 'x-forwarded-for'
};

export const distributeAmount = async (req, res) => {
  const { agentId, userId, amount, beforeamount } = req.body;

  if (!agentId || !userId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid input." });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validate and update agent balance
    await validateAgentExists(connection, agentId);
    await updateAgentBalance(connection, agentId, parseFloat(amount));

    // Validate and update user balance
    await validateUserExists(connection, userId);
    await updateUserBalance(connection, userId, parseFloat(amount));

    const agentIP = getClientIp(req); //Pass req here

    const transactionDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");
    // Insert transaction records
    await connection.query(
      "INSERT INTO transactions (agent_id, user_id, amount, beforeamount, recipient_agent_id, type, withdraw, deposit, date, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        agentId,
        userId,
        amount,
        beforeamount,
        "Null",
        "Deposit",
        0.0,
        amount,
        transactionDate,
        agentIP,
      ]
    );

    // Check if the sender agent's role is Admin, then refill the sent amount
    const [adminRoleResult] = await connection.query(
      "SELECT arole FROM agents WHERE agid = ?",
      [agentId]
    );

    if (adminRoleResult.length > 0 && adminRoleResult[0].arole === "Admin") {
      const [adminBalanceResult] = await connection.query(
        "SELECT balance FROM agents WHERE agid = ? FOR UPDATE",
        [agentId]
      );
      const adminBalance = parseFloat(adminBalanceResult[0].balance || 0);
      const updatedAdminBalance = adminBalance + parseFloat(amount);

      await connection.query("UPDATE agents SET balance = ? WHERE agid = ?", [
        updatedAdminBalance,
        agentId,
      ]);
    }

    await connection.commit();
    res.status(200).json({ message: "Amount distributed successfully." });
  } catch (error) {
    await connection.rollback();
    console.error("Transaction error:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const distributeAgentAmount = async (req, res) => {
  const { recipientAgentId, agentId, amount, beforeamount } = req.body;

  // Validate input
  if (!recipientAgentId || !agentId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid input." });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validate and update the sender agent's balance and dbalance (debit)
    await validateAgentExists(connection, agentId);
    await updateAgentBalanceAndDbalance(
      connection,
      agentId,
      parseFloat(amount)
    );

    // Validate the recipient agent exists
    await validateAgentExists(connection, recipientAgentId);

    // Update the recipient agent's balance only (credit)
    const [recipientBalanceResult] = await connection.query(
      "SELECT balance FROM agents WHERE agid = ? FOR UPDATE",
      [recipientAgentId]
    );
    const recipientBalance = parseFloat(recipientBalanceResult[0].balance || 0);
    const updatedRecipientBalance = recipientBalance + parseFloat(amount);

    await connection.query("UPDATE agents SET balance = ? WHERE agid = ?", [
      updatedRecipientBalance,
      recipientAgentId,
    ]);

    const agentIP = getClientIp(req); // ✅ Pass req here

    const transactionDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    // Insert transaction records for logging
    await connection.query(
      "INSERT INTO transactions (agent_id, recipient_agent_id, amount, beforeamount, user_id, type, deposit, withdraw, date, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        agentId,
        recipientAgentId,
        amount,
        beforeamount,
        "Null",
        "Deposit",
        amount,
        0.0,
        transactionDate,
        agentIP,
      ]
    );

    // Check if the sender agent's role is Admin, then refill the sent amount
    const [adminRoleResult] = await connection.query(
      "SELECT arole FROM agents WHERE agid = ?",
      [agentId]
    );

    if (adminRoleResult.length > 0 && adminRoleResult[0].arole === "Admin") {
      const [adminBalanceResult] = await connection.query(
        "SELECT balance FROM agents WHERE agid = ? FOR UPDATE",
        [agentId]
      );
      const adminBalance = parseFloat(adminBalanceResult[0].balance || 0);
      const updatedAdminBalance = adminBalance + parseFloat(amount);

      await connection.query("UPDATE agents SET balance = ? WHERE agid = ?", [
        updatedAdminBalance,
        agentId,
      ]);
    }

    await connection.commit();
    res.status(200).json({ message: "Balance distributed successfully." });
  } catch (error) {
    await connection.rollback();
    console.error("Error during balance distribution:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const withdrawAgentToAgent = async (req, res) => {
  console.log("Received withdraw request:", req.body); // Debug log

  const { selectedAgentId, loggedInAgentId, amount } = req.body;

  if (!selectedAgentId || !loggedInAgentId || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid input. Check fields." });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validate selected agent's balance
    await validateAgentExists(connection, selectedAgentId);
    await updateAgentBalance(connection, selectedAgentId, parseFloat(amount));

    // Validate logged-in agent
    await validateAgentExists(connection, loggedInAgentId);

    // Update logged-in agent's balance (credit)
    const [loggedInAgentBalanceResult] = await connection.query(
      "SELECT balance FROM agents WHERE agid = ? FOR UPDATE",
      [loggedInAgentId]
    );
    const loggedInAgentBalance = parseFloat(
      loggedInAgentBalanceResult[0]?.balance || 0
    );
    const updatedLoggedInAgentBalance =
      loggedInAgentBalance + parseFloat(amount);

    await connection.query("UPDATE agents SET balance = ? WHERE agid = ?", [
      updatedLoggedInAgentBalance,
      loggedInAgentId,
    ]);

    const agentIP = getClientIp(req); // ✅ Pass req here

    // Log transaction
    const transactionDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await connection.query(
      "INSERT INTO transactions (agent_id, recipient_agent_id, amount, beforeamount, user_id, type, deposit, withdraw, date, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        selectedAgentId, // Sender agent
        loggedInAgentId, // Logged-in agent (receiver)
        amount,
        beforeamount,
        "Null",
        "Withdraw",
        0.0,
        amount,
        transactionDate,
        agentIP,
      ]
    );

    await connection.commit();
    res.status(200).json({
      message: "Amount withdrawn successfully and added to logged-in agent.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error during withdrawal:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const withdrawAgentToUser = async (req, res) => {
  console.log("[BACKEND] Received withdraw request:", req.body);

  const { loggedInAgentId, userId, amount, beforeamount } = req.body;

  if (!loggedInAgentId || !userId || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: "Invalid input. Check fields." });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Validate user exists
    await validateUserExists(connection, userId);

    // Get user balance and check if withdrawal is possible
    const [userBalanceResult] = await connection.query(
      "SELECT balance FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );

    if (userBalanceResult.length === 0) {
      throw new Error("User not found.");
    }

    const userBalance = parseFloat(userBalanceResult[0].balance || 0);

    if (userBalance < amount) {
      throw new Error("Insufficient user balance.");
    }

    const updatedUserBalance = userBalance - parseFloat(amount);

    // Deduct amount from user's balance
    await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
      updatedUserBalance,
      userId,
    ]);

    // Validate logged-in agent exists
    await validateAgentExists(connection, loggedInAgentId);

    // Get logged-in agent's balance
    const [loggedInAgentBalanceResult] = await connection.query(
      "SELECT balance FROM agents WHERE agid = ? FOR UPDATE",
      [loggedInAgentId]
    );

    if (loggedInAgentBalanceResult.length === 0) {
      throw new Error("Logged-in agent not found.");
    }

    const loggedInAgentBalance = parseFloat(
      loggedInAgentBalanceResult[0].balance || 0
    );
    const updatedLoggedInAgentBalance =
      loggedInAgentBalance + parseFloat(amount);

    // Add amount to logged-in agent's balance
    await connection.query("UPDATE agents SET balance = ? WHERE agid = ?", [
      updatedLoggedInAgentBalance,
      loggedInAgentId,
    ]);

    const agentIP = getClientIp(req); // ✅ Pass req here

    // Log transaction
    const transactionDate = new Date()
      .toISOString()
      .slice(0, 19)
      .replace("T", " ");

    await connection.query(
      "INSERT INTO transactions (agent_id, user_id, amount, beforeamount, recipient_agent_id, type, deposit, withdraw, date, ip_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        loggedInAgentId, // Logged-in agent (receiver)
        userId, // User (withdrawal source)
        amount,
        beforeamount,
        "Null",
        "Withdraw",
        0.0,
        amount,
        transactionDate,
        agentIP,
      ]
    );

    await connection.commit();
    res.status(200).json({
      message: "Amount withdrawn successfully and added to logged-in agent.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("[BACKEND] Transaction error:", error.message);
    res.status(500).json({ message: error.message });
  } finally {
    connection.release();
  }
};

export const transactionrec = async (req, res) => {
  const { fromDate, toDate } = req.query;

  console.log("Received fromDate:", fromDate, "toDate:", toDate); // Debugging logs

  let connection; // Declare connection variable outside the try block

  try {
    let query = "SELECT * FROM transactions WHERE 1=1";
    const params = [];

    if (fromDate) {
      query += " AND DATE(date) >= DATE(?)";
      params.push(fromDate);
    }
    if (toDate) {
      query += " AND DATE(date) <= DATE(?)";
      params.push(toDate);
    }

    const db = await connectToDatabase();
    connection = await db.getConnection(); // Initialize connection

    const [transactions] = await connection.execute(query, params);

    console.log("Fetched transactions:", transactions); // Log fetched data
    res.status(200).json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ message: "Failed to fetch transactions." });
  } finally {
    // Release the connection only if it was successfully initialized
    if (connection) {
      try {
        connection.release();
      } catch (releaseError) {
        console.error("Error releasing connection:", releaseError.message);
      }
    }
  }
};

export const countAgent = async (req, res) => {
  try {
    const db = await connectToDatabase();

    // Fetch all agents
    const [agents] = await db.query("SELECT agid FROM agents");

    // Prepare an object to store counts
    let agentCounts = {};

    // Loop through each agent and count their referrals
    for (const agent of agents) {
      const [result] = await db.query(
        "SELECT COUNT(*) AS count FROM agents WHERE agentreferral = ?",
        [agent.agid]
      );
      agentCounts[agent.agid] = result[0].count;
    }

    res.status(200).json(agentCounts);
  } catch (err) {
    console.error("Error fetching agent counts:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
