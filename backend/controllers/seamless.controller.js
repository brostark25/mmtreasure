import express from "express";
import { connectToDatabase } from "../config/db.js";
import { v4 as uuidv4 } from "uuid"; // For generating unique references
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
// Import logging library
import fs from "fs";
import dotenv from "dotenv";
import { parse } from "path";
import Decimal from "decimal.js"; // Install with `npm install decimal.js`
dotenv.config();

const secureLogin = process.env.PRAGMATIC_PROVIDER_ID; // Ensure correct provider ID
const secretKey = process.env.PRAGMATIC_API_KEY; // Ensure correct API key
const transactionId = Date.now();

// Function to calculate the expected hash from the parameters
const calculateHash = (params, secretKey) => {
  const sortedKeys = Object.keys(params).sort();

  // Ensure all parameter values are defined
  const paramString =
    sortedKeys
      .map((key) => `${key}=${params[key] || ""}`) // Default to an empty string if undefined
      .join("&") + secretKey;

  console.log("Concatenated String:", paramString);

  return crypto.createHash("md5").update(paramString).digest("hex");
};

// Seamless Wallet Endpoint Controller

// Auto-finalization of Unfinished Rounds
export const finalizeUnfinishedRounds = async (req, res) => {
  const { roundId, action, outcome, amount } = req.body;
  if (!roundId || !action) {
    return res
      .status(400)
      .json({ error: 7, description: "Bad parameters in the request." });
  }

  try {
    const db = await connectToDatabase();

    switch (action) {
      case "refund": // Unplayed round
        await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
          amount,
          req.userId,
        ]);
        break;

      case "win": // Partially played, with wins
        await db.query("UPDATE users SET balance = balance + ? WHERE id = ?", [
          outcome.amount,
          req.userId,
        ]);
        break;

      case "lose": // Partially played, without wins
        // No balance update needed
        break;

      default:
        return res
          .status(400)
          .json({ error: 7, description: "Invalid action type." });
    }

    // Mark round as finalized
    await db.query("UPDATE rounds SET status = 'finalized' WHERE id = ?", [
      roundId,
    ]);

    res
      .status(200)
      .json({ error: 0, description: "Round finalized successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 100, description: "Internal server error." });
  }
};

// Function to log response data to a file or stdout
const logDebugInfo = (data) => {
  const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(
    data,
    null,
    2
  )}\n`;
  fs.appendFileSync("debug.log", logEntry);
  console.log(logEntry);
};

// Middleware to validate required parameters
export const validateParams = (req, res, next) => {
  //req.body.jurisdiction = 99;
  const { hash, token, providerId: reqProviderId } = req.body;
  const providerId = reqProviderId || process.env.PRAGMATIC_PROVIDER_ID || "";

  if (!hash || !token || !providerId) {
    console.error("Missing parameters:", { hash, token, providerId });
    return res.status(400).json({
      error: 7,
      description: "Missing required parameters: hash, providerId, token.",
    });
  }

  req.params = { hash, token, providerId };
  next();
};

// Middleware to validate the hash
export const validateHash = (req, res, next) => {
  const { hash, token, providerId } = req.params;
  const secretKey = process.env.PRAGMATIC_API_KEY;

  if (!secretKey) {
    console.error("Missing secretKey environment variable");
    return res.status(500).json({
      error: 100,
      description: "Internal server configuration error.",
    });
  }

  const params = { token, providerId };
  const expectedHash = calculateHash(params, secretKey);

  if (hash !== expectedHash) {
    return res.status(401).json({ error: 5, description: "Invalid hash." });
  }

  next();
};

// Middleware to handle user (extract userId from token and check if exists)
export const handleUser = async (req, res, next) => {
  const { token } = req.params;

  try {
    const userId = token.split("-")[0];
    if (!userId) {
      return res
        .status(400)
        .json({ error: 4, description: "Invalid token format." });
    }

    const db = await connectToDatabase();
    const [rows] = await db.query("SELECT * FROM users WHERE uid = ?", [
      userId,
    ]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 2, description: "User not found." });
    }

    req.user = rows[0];
    next();
  } catch (err) {
    console.error("Error handling user:", err);
    res.status(500).json({ error: 100, description: "Internal server error." });
  }
};

// Main authentication endpoint controller
export const authenEnd = async (req, res) => {
  const { providerId, token } = req.params;
  const { user } = req;

  try {
    let minBet = user.currency === "MMK" ? 5 : user.currency === "THB" ? 1 : 0;
    let maxBet = 100000;

    const responseData = {
      userId: user.uid,
      cash: user.balance,
      currency: user.currency,
      bonus: 0,
      token,
      error: 0,
      description: "Success",
      /*betLimits: {
        defaultBet: minBet,
        minBet,
        maxBet,
      },*/
    };

    logDebugInfo(responseData);
    res.status(200).json(responseData);
  } catch (err) {
    console.error("Error during authentication:", err);
    res.status(500).json({ error: 100, description: "Internal server error." });
  }
};

// Helper function to format numbers with (10,2) precision
const formatDecimal = (value) =>
  new Decimal(value).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

// Function to get existing transaction and balance
const getExistingTransaction = async (db, reference, userId) => {
  const [transactionRows] = await db.query(
    "SELECT transactionId FROM user_transactions WHERE reference = ?",
    [reference]
  );
  const [userRows] = await db.query(
    "SELECT balance, currency FROM users WHERE uid = ?",
    [userId]
  );
  return {
    transactionId: transactionRows.length > 0 ? transactionRows[0].transactionId : null,
    balance: userRows.length > 0 ? formatDecimal(userRows[0].balance) : null,
    currency: userRows.length > 0 ? userRows[0].currency : null,
  };
};

// Helper function to generate a valid transaction ID
const generateTransactionId = () => {
  return Math.random().toString(36).substr(2, 16); // Generates a unique string with 16 characters
};

export const balanceEnd = async (req, res) => {
  const { providerId, userId, hash } = req.body;

  if (!providerId || !userId || !hash) {
    return res.status(400).json({
      error: 7,
      description: "Missing required fields: providerId, userId, or hash.",
    });
  }

  try {
    const db = await connectToDatabase();
    const [rows] = await db.query(
      "SELECT currency, balance FROM users WHERE uid = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 2, description: "User not found." });
    }

    const user = rows[0];
    res.status(200).json({
      currency: user.currency,
      cash: formatDecimal(user.balance),
      bonus: 0,
      error: 0,
      description: "Success",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 100, description: "Internal server error." });
  }
};

export const betEnd = async (req, res) => {
  const {
    hash,
    userId,
    gameId,
    roundId,
    amount,
    reference,
    providerId,
    timestamp,
    roundDetails,
  } = req.body;

  if (
    !hash ||
    !userId ||
    !gameId ||
    !roundId ||
    !amount ||
    !reference ||
    !providerId ||
    !timestamp ||
    !roundDetails
  ) {
    return res
      .status(400)
      .json({ error: 1, description: "Missing parameters." });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check for existing transaction
    const { transactionId, balance, currency } = await getExistingTransaction(
      db,
      reference,
      userId
    );

    if (transactionId) {
      await connection.rollback();
      return res.status(200).json({
        transactionId,
        currency,
        cash: balance,
        bonus: 0,
        usedPromo: 0,
        error: 0,
        description: "Transaction already processed.",
      });
    }

    // Fetch user balance with lock
    const [userRows] = await connection.query(
      "SELECT balance, currency FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );

    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 2, description: "User not found." });
    }

    const user = userRows[0];
    const currentBalance = new Decimal(user.balance);
    const betAmount = new Decimal(amount);

    // Validate sufficient funds
    if (currentBalance.minus(betAmount).isNegative()) {
      await connection.rollback();
      return res
        .status(400)
        .json({ error: 3, description: "Insufficient funds." });
    }

    // Update balance for new transaction
    const newBalance = currentBalance
      .minus(betAmount)
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
    await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
      newBalance.toNumber(),
      userId,
    ]);

    // Record transaction
    const newTransactionId = generateTransactionId();
    await connection.query(
      "INSERT INTO user_transactions (reference, userId, gameId, roundId, amount, timestamp, roundDetails, transactionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        reference,
        userId,
        gameId,
        roundId,
        formatDecimal(amount),
        timestamp,
        roundDetails,
        newTransactionId,
      ]
    );

    await connection.query(
      "INSERT INTO users_bet (uid, roundid, gameid, beforeamt, betamt) VALUES (?, ?, ?, ?, ?)",
      [userId, roundId, gameId, currentBalance.toNumber(), betAmount.toNumber()]
    );

    await connection.commit();

    res.status(200).json({
      transactionId: newTransactionId,
      currency: user.currency,
      cash: newBalance.toNumber(),
      bonus: 0,
      usedPromo: 0,
      error: 0,
      description: "Success",
    });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ error: 4, description: "Internal Server Error." });
  } finally {
    connection.release();
  }
};


// Result Endpoint with idempotency
export const resultEnd = async (req, res) => {
  const {
    userId,
    reference,
    amount,
    roundId,
    gameId,
    promoWinAmount,
    promoWinReference,
    promoCampaignID,
    promoCampaignType,
  } = req.body;

  if (!userId || !reference || !amount || !roundId || !gameId) {
    return res.status(400).json({ error: 1, description: "Missing parameters." });
  }

  // Ensure promotional fields appear together if any of them are provided
  const promoFields = [promoWinAmount, promoWinReference, promoCampaignID, promoCampaignType];
  const hasPromoFields = promoFields.some((field) => field !== undefined);
  const allPromoFieldsPresent = promoFields.every((field) => field !== undefined);

  if (hasPromoFields && !allPromoFieldsPresent) {
    return res.status(400).json({
      error: 2,
      description: "Incomplete promotional fields. All promo fields must appear together.",
    });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check for existing transaction
    const { transactionId, balance, currency } = await getExistingTransaction(
      db,
      reference,
      userId
    );

    if (transactionId) {
      await connection.rollback();
      return res.status(200).json({
        transactionId,
        currency,
        cash: balance,
        bonus: 0,
        error: 0,
        description: "Transaction already processed.",
      });
    }

    // Fetch and lock user balance
    const [userRows] = await connection.query(
      "SELECT balance, currency FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );

    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 3, description: "User not found." });
    }

    const user = userRows[0];
    const currentBalance = new Decimal(user.balance);
    const transactionAmount = new Decimal(amount);
    const promoAmount = promoWinAmount ? new Decimal(promoWinAmount) : new Decimal(0);

    // Calculate the new balance
    const newBalance = currentBalance.plus(transactionAmount).plus(promoAmount).toDecimalPlaces(2);

    // Update balance
    await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
      newBalance.toNumber(),
      userId,
    ]);

    // Record transaction
    const newTransactionId = generateTransactionId();
    await connection.query(
      "INSERT INTO user_transactions (reference, userId, gameId, roundId, amount, transactionId) VALUES (?, ?, ?, ?, ?, ?)",
      [
        reference,
        userId,
        gameId,
        roundId,
        transactionAmount.toNumber(),
        //promoAmount.toNumber() || null,
        //promoWinReference || null,
        //promoCampaignID || null,
        //promoCampaignType || null,
        newTransactionId,
      ]
    );

    await connection.commit();

    res.status(200).json({
      transactionId: newTransactionId,
      currency: user.currency,
      cash: newBalance.toNumber(),
      bonus: 0,
      error: 0,
      description: "Success",
    });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ error: 4, description: "Internal Server Error." });
  } finally {
    connection.release();
  }
};


// BonusWin Endpoint
export const bonusWinEnd = async (req, res) => {
  const {
    hash,
    userId,
    amount,
    reference,
    providerId,
    timestamp,
    bonusCode,
  } = req.body;

  // Check for missing required parameters
  if (!hash || !userId || !amount || !reference || !providerId || !timestamp) {
    return res
      .status(400)
      .json({ error: 1, description: "Missing required parameters." });
  }

  const db = await connectToDatabase();

  try {
    // Fetch the user's balance and currency
    const [userRows] = await db.query(
      "SELECT balance, currency FROM users WHERE uid = ?",
      [userId]
    );

    if (!userRows.length) {
      return res.status(404).json({
        error: 3,
        description: "User not found.",
      });
    }

    const user = userRows[0];

    // Ensure balance is a valid number
    const balance = parseFloat(user.balance);
    if (isNaN(balance)) {
      return res.status(500).json({
        error: 4,
        description: "Invalid user balance.",
      });
    }

    // Check the bonus checksum
    const [transactions] = await db.query(
      "SELECT SUM(amount) AS totalCredited FROM user_transactions WHERE userId = ? AND bonusCode = ?",
      [userId, bonusCode]
    );

    const totalCredited = transactions[0]?.totalCredited || 0;

    if (parseFloat(totalCredited) !== parseFloat(amount)) {
      return res.status(400).json({
        error: 2,
        description: "BonusWin checksum mismatch.",
        credited: totalCredited,
        expected: amount,
      });
    }

    // Respond with the required data
    res.status(200).json({
      transactionId: reference, // Use the reference as the transactionId
      currency: user.currency,
      cash: parseFloat(balance.toFixed(2)), // Ensure cash is a valid number
      bonus: 0, // Set bonus to 0 as per the context
      error: 0,
      description: "BonusWin checksum validated successfully.",
    });
  } catch (err) {
    console.error("Error in bonusWinEnd:", err);
    res.status(500).json({ error: 5, description: "Internal Server Error." });
  }
};


// **Jackpot Win Endpoint**
export const jackpotWinEnd = async (req, res) => {
  req.body.timestamp = Date.now();
  const {
    hash,
    providerId,
    timestamp,
    userId,
    gameId,
    roundId,
    jackpotId,
    amount,
    reference,
  } = req.body;

  if (
    !hash ||
    !providerId ||
    !timestamp ||
    !userId ||
    !gameId ||
    !roundId ||
    !jackpotId ||
    !amount ||
    !reference
  ) {
    return res
      .status(400)
      .json({ error: 1, description: "Missing required parameters." });
  }

  if (isNaN(amount) || amount < 0) {
    return res.status(400).json({
      error: 1,
      description: "'amount' must be a valid non-negative number.",
    });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    const [userRows] = await connection.query(
      "SELECT balance, currency FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );

    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 2, description: "User not found." });
    }

    const user = userRows[0];
    const userBalance = parseFloat(user.balance);

    const [transactionRows] = await connection.query(
      "SELECT id FROM user_transactions WHERE reference = ? OR transactionId = ?",
      [reference, req.body.transactionId]
    );
    if (transactionRows.length) {
      await connection.rollback();
      return res.status(200).json({
        transactionId: transactionRows[0].id,
        currency: user.currency,
        cash: Number(formatDecimal(userBalance)), // Ensure cash is formatted as JSON Number (10,2)
        bonus: 0,
        error: 0,
        description: "Transaction already processed.",
      });
    }

    const newBalance = userBalance + parseFloat(amount);
    await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
      newBalance,
      userId,
    ]);

    const [transactionResult] = await connection.query(
      "INSERT INTO user_transactions (reference, userId, amount, gameId, roundId, jackpotId, timestamp, transactionId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        reference,
        userId,
        parseFloat(amount).toFixed(2),
        gameId,
        roundId,
        jackpotId,
        timestamp,
        req.body.transactionId || Date.now(),
      ]
    );

    await connection.commit();
    res.status(200).json({
      transactionId: transactionResult.insertId,
      currency: user.currency,
      cash: Number(formatDecimal(newBalance)), // Ensure cash is formatted as JSON Number (10,2)
      bonus: 0,
      error: 0,
      description: "Success",
    });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ error: 4, description: "Internal Server Error." });
  } finally {
    connection.release();
  }
};

// **End Round Endpoint**
export const endroundEnd = async (req, res) => {
  const { hash, userId, gameId, roundId, providerId, bonusCode } = req.body;

  if (!hash || !userId || !gameId || !roundId || !providerId) {
    return res
      .status(400)
      .json({ error: 1, description: "Missing required parameters." });
  }

  const db = await connectToDatabase();

  try {
    const [roundRows] = await db.query(
      "SELECT status FROM rounds WHERE id = ?",
      [roundId]
    );
    if (!roundRows.length) {
      return res
        .status(404)
        .json({ error: 2, description: "Round not found." });
    }

    const round = roundRows[0];
    if (round.status === "ended") {
      const [userRows] = await db.query(
        "SELECT balance AS cash, bonus FROM users WHERE uid = ?",
        [userId]
      );
      if (!userRows.length) {
        return res
          .status(404)
          .json({ error: 3, description: "User not found." });
      }
      const user = userRows[0];
      return res.status(200).json({
        cash: parseFloat(user.cash).toFixed(2),
        bonus: parseFloat(user.bonus || 0).toFixed(2),
        error: 0,
        description: "Round already finalized.",
      });
    }

    await db.query("UPDATE rounds SET status = 'ended' WHERE id = ?", [
      roundId,
    ]);

    const [userRows] = await db.query(
      "SELECT balance AS cash, bonus FROM users WHERE uid = ?",
      [userId]
    );
    if (!userRows.length) {
      return res.status(404).json({ error: 3, description: "User not found." });
    }

    const user = userRows[0];
    res.status(200).json({
      cash: parseFloat(user.cash).toFixed(2),
      bonus: 0,
      error: 0,
      description: "Success",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 4, description: "Internal Server Error." });
  }
};

export const refundEnd = async (req, res) => {
  const { reference, providerId, userId, hash } = req.body;

  // Validate required parameters
  if (!reference || !providerId || !userId || !hash) {
    return res.status(400).json({
      error: 1,
      description: "Missing required parameters.",
    });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if the user exists
    const [userRows] = await connection.query(
      "SELECT balance FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );

    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({
        error: 2,
        description: "User not found.",
      });
    }

    // Check if the transaction already exists
    const [transactionRows] = await connection.query(
      "SELECT id, amount FROM user_transactions WHERE reference = ?",
      [reference]
    );

    if (!transactionRows.length) {
      await connection.rollback();
      return res.status(200).json({
        transactionId: 0,
        error: 0, // Change to error: 0 for non-existing refunds
        description: "Bet transaction not found. No refund processed.",
      });
    }

    const existingTransaction = transactionRows[0];
    const existingTransactionId = existingTransaction.id;
    const amount = parseFloat(existingTransaction.amount);

    // Check if a refund already exists for this transaction
    const [refundRows] = await connection.query(
      "SELECT id FROM refunds WHERE transaction_id = ?",
      [existingTransactionId]
    );

    if (refundRows.length) {
      await connection.rollback();
      return res.status(200).json({
        transactionId: refundRows[0].id,
        error: 0,
        description: "Transaction already refunded.",
      });
    }

    // Process the refund
    await connection.query(
      "UPDATE users SET balance = balance + ? WHERE uid = ?",
      [amount, userId]
    );

    const [refundResult] = await connection.query(
      "INSERT INTO refunds (transaction_id, userId, amount, reference, created_at) VALUES (?, ?, ?, ?, NOW())",
      [existingTransactionId, userId, amount, reference]
    );

    await connection.commit();

    // Return successful response with transactionId and appropriate description
    res.status(200).json({
      transactionId: refundResult.insertId,
      error: 0,
      description: "Refund processed successfully",
    });
  } catch (err) {
    console.error("Error processing refund:", err);
    await connection.rollback();
    res.status(500).json({
      error: 1,
      description: "Internal Server Error. Please try again later.",
    });
  } finally {
    connection.release();
  }
};

export const promoWinEnd = async (req, res) => {
  const {
    hash,
    providerId,
    timestamp,
    userId,
    campaignId,
    campaignType,
    amount,
    currency,
    reference,
  } = req.body;

  // Validate required parameters
  if (
    !hash ||
    !providerId ||
    !timestamp ||
    !userId ||
    !campaignId ||
    !campaignType ||
    !amount ||
    !currency ||
    !reference
  ) {
    return res
      .status(400)
      .json({ error: 1, description: "Missing required parameters." });
  }

  // Validate amount
  if (isNaN(amount) || amount < 0) {
    return res.status(400).json({
      error: 1,
      description: "'amount' must be a valid non-negative number.",
    });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Check if the user exists and lock their balance for update
    const [userRows] = await connection.query(
      "SELECT balance, currency FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );
    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 2, description: "User not found." });
    }

    const user = userRows[0];
    const userBalance = parseFloat(user.balance);

    // Check for existing transaction (idempotency)
    const [existingTransaction] = await connection.query(
      "SELECT id FROM user_transactions WHERE reference = ?",
      [reference]
    );
    if (existingTransaction.length) {
      await connection.rollback();
      return res.status(200).json({
        transactionId: existingTransaction[0].id,
        currency: user.currency,
        cash: parseFloat(userBalance.toFixed(2)), // Ensure cash is a valid JSON number
        bonus: 0,
        error: 0,
        description: "Transaction already processed.",
      });
    }

    // Update the user's balance
    const newBalance = userBalance + parseFloat(amount);
    await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
      newBalance,
      userId,
    ]);

    // Insert the new transaction record
    const [transactionResult] = await connection.query(
      "INSERT INTO user_transactions (reference, userId, amount, timestamp, currency) VALUES (?, ?, ?, ?, ?)",
      [
        reference,
        userId,
        parseFloat(amount).toFixed(2),
        //campaignId,
        //campaignType,
        timestamp,
        currency,
      ]
    );

    await connection.commit();

    // Send the success response
    res.status(200).json({
      transactionId: transactionResult.insertId,
      currency: user.currency,
      cash: parseFloat(newBalance.toFixed(2)), // Ensure cash is a valid JSON number
      bonus: 0,
      error: 0,
      description: "Success",
    });
  } catch (err) {
    console.error("Error in promoWinEnd:", err);
    await connection.rollback();
    res.status(500).json({ error: 3, description: "Internal Server Error." });
  } finally {
    connection.release();
  }
};

export const rollbackEnd = async (req, res) => {
  const { hash, providerId, userId, roundId, gameId } = req.body;

  if (!hash || !providerId || !userId || !roundId || !gameId) {
    return res
      .status(400)
      .json({ error: 1, description: "Missing required parameters." });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [transactions] = await connection.query(
      "SELECT id, amount FROM user_transactions WHERE userId = ? AND roundId = ? AND gameId = ?",
      [userId, roundId, gameId]
    );

    if (!transactions.length) {
      await connection.rollback();
      return res.status(404).json({
        error: 2,
        description: "Transactions not found for the given round.",
      });
    }

    let totalRollbackAmount = 0;
    for (const transaction of transactions) {
      totalRollbackAmount += parseFloat(transaction.amount);
      await connection.query("DELETE FROM user_transactions WHERE id = ?", [
        transaction.id,
      ]);
    }

    const [user] = await connection.query(
      "SELECT balance FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );
    if (!user.length) {
      await connection.rollback();
      return res.status(404).json({ error: 3, description: "User not found." });
    }

    const newBalance = parseFloat(user[0].balance) + totalRollbackAmount;
    await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
      newBalance,
      userId,
    ]);

    await connection.commit();
    res.status(200).json({
      cash: newBalance.toFixed(2),
      bonus: 0,
      error: 0,
      description: "Rollback completed successfully.",
    });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ error: 4, description: "Internal Server Error." });
  } finally {
    connection.release();
  }
};

export const adjustEnd = async (req, res) => {
  const {
    hash,
    providerId,
    userId,
    amount,
    reference,
    roundId,
    gameld,
    validBetAmount,
    timestamp,
    token, // Optional field
  } = req.body;

  // Check for required parameters
  if (
    !hash ||
    !providerId ||
    !userId ||
    !amount ||
    !reference ||
    !roundId ||
    !gameld ||
    !validBetAmount ||
    !timestamp
  ) {
    return res
      .status(400)
      .json({ error: 1, description: "Missing required parameters." });
  }

  if (isNaN(amount)) {
    return res
      .status(400)
      .json({ error: 1, description: "'amount' must be a valid number." });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Fetch the user's current balance
    const [userRows] = await connection.query(
      "SELECT balance FROM users WHERE uid = ? FOR UPDATE",
      [userId]
    );
    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({ error: 2, description: "User not found." });
    }

    const userBalance = parseFloat(userRows[0].balance);

    // If the amount is negative, check if the balance is sufficient
    if (amount < 0 && userBalance + amount < 0) {
      await connection.rollback();
      return res.status(400).json({
        error: 1,
        description: "Insufficient balance",
      });
    }

    const newBalance = userBalance + parseFloat(amount);

    // Check if this transaction has already been processed using the reference
    const [existingTransaction] = await connection.query(
      "SELECT id FROM adjustments WHERE reference = ?",
      [reference]
    );
    if (existingTransaction.length) {
      await connection.rollback();
      return res.status(200).json({
        transactionId: existingTransaction[0].id,
        currency: "USD", // Assuming USD as the currency for now
        cash: Number(formatDecimal(newBalance)), // Ensure cash is formatted as JSON Number with (10,2)
        bonus: 0,
        error: 0,
        description: "Adjustment already processed.",
      });
    }

    // Update the user's balance
    await connection.query("UPDATE users SET balance = ? WHERE uid = ?", [
      newBalance,
      userId,
    ]);

    // Log the adjustment in the database
    const [adjustmentResult] = await connection.query(
      "INSERT INTO adjustments (userId, amount, reason, reference, created_at) VALUES (?, ?, ?, ?, NOW())",
      [userId, amount, "Adjustment", reference]
    );

    await connection.commit();

    // Return the response in the required format
    res.status(200).json({
      transactionId: adjustmentResult.insertId,
      currency: "USD", // Assuming USD as the currency for now
      cash: Number(formatDecimal(newBalance)), // Ensure cash is formatted as JSON Number with (10,2)
      bonus: 0,
      error: 0,
      description: "Adjustment processed successfully.",
    });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({ error: 3, description: "Internal Server Error." });
  } finally {
    connection.release();
  }
};

export const roundDetails = async (req, res) => {
  const {
    hash,
    userId,
    roundId,
    providerId,
    smResult,
    gameCategory,
    betMultiplier,
  } = req.body;

  // Check for required parameters
  if (
    !hash ||
    !userId ||
    !roundId ||
    !providerId ||
    !smResult ||
    !gameCategory ||
    !betMultiplier
  ) {
    return res.status(400).json({
      error: 1,
      description: "Missing required parameters.",
    });
  }

  // Validate that betMultiplier is a number
  if (isNaN(betMultiplier)) {
    return res.status(400).json({
      error: 1,
      description: "'betMultiplier' must be a valid number.",
    });
  }

  const db = await connectToDatabase();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // Fetch the user to verify their existence
    const [userRows] = await connection.query(
      "SELECT * FROM users WHERE uid = ?",
      [userId]
    );
    if (!userRows.length) {
      await connection.rollback();
      return res.status(404).json({
        error: 2,
        description: "User not found.",
      });
    }

    // Store the round details in the database
    const [result] = await connection.query(
      "INSERT INTO round_details (userId, roundId, providerId, smResult, gameCategory, betMultiplier, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [userId, roundId, providerId, smResult, gameCategory, betMultiplier]
    );

    await connection.commit();

    // Send response
    res.status(200).json({
      error: 0,
      description: "Success",
    });
  } catch (err) {
    console.error(err);
    await connection.rollback();
    res.status(500).json({
      error: 3,
      description: "Internal Server Error.",
    });
  } finally {
    connection.release();
  }
};
