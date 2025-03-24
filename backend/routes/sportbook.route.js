import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { tokenPipeline } from "../middleware/authMiddleware.js";
import {
  createSBAccount,
  fetchticket,
  getLeague,
  getLoginUrl,
  getParlay,
  getSbAccountBalance,
  getTeam,
  markFetched,
  sbLogout,
  transferFundWithRef,
  updateMemberSettings,
  verifyDepositWithdraw,
} from "../controllers/sportbook.controller.js";
import { get } from "http";

dotenv.config();
const router = express.Router();
const JWT_KEY = process.env.JWT_KEY;

// Middleware for verifying JWT tokens
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_KEY);
    req.userId = decoded.u; // Attach `uid` to `req`
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

router.post("/ibet/sportbook/createaccount", createSBAccount);
router.post("/ibet/sportbook/getbalance", getSbAccountBalance);
router.post("/ibet/sportbook/fetcht", fetchticket);
router.post("/ibet/sportbook/markfetcht", markFetched);
router.post("/ibet/sportbook/loginurl", getLoginUrl);
router.post("/ibet/sportbook/updatemembersett", updateMemberSettings);
router.post("/ibet/sportbook/transferfundref", transferFundWithRef);
router.post("/ibet/sportbook/verifydepositwithd", verifyDepositWithdraw);
router.post("/ibet/sportbook/getteam", getTeam);
router.post("/ibet/sportbook/getleague", getLeague);
router.post("/ibet/sportbook/getparlay", getParlay);
router.post("/ibet/sportbook/logout", sbLogout);

export default router;
