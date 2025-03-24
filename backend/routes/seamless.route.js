import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { tokenPipeline } from "../middleware/authMiddleware.js";
import {
  validateParams,
  validateHash,
  handleUser,
  authenEnd,
  balanceEnd,
  betEnd,
  bonusWinEnd,
  endroundEnd,
  refundEnd,
  resultEnd,
  jackpotWinEnd,
  promoWinEnd,
  adjustEnd,
  roundDetails,
} from "../controllers/seamless.controller.js";
import {
  getCasinoGames,
  getCasinoLobbyGames,
  launchGame,
  openHistoryExt,
} from "../controllers/pragmatic.controller.js";
import { registerPlayer } from "../controllers/shan.controller.js";

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

// Routes with native middleware chaining
router.post(
  "/p2provider/pragmatic/authenticate",
  [validateParams, validateHash, handleUser,  authenEnd] // Middleware chain
);

router.post("/p2provider/pragmatic/balance", balanceEnd);
router.post("/p2provider/pragmatic/bet", betEnd);
router.post("/p2provider/pragmatic/result", resultEnd);
router.post("/p2provider/pragmatic/refund", refundEnd);
router.post("/p2provider/pragmatic/bonuswin", bonusWinEnd);
router.post("/p2provider/pragmatic/jackpotwin", jackpotWinEnd);
router.post("/p2provider/pragmatic/promowin", promoWinEnd);
router.post("/p2provider/pragmatic/adjustment", verifyToken, adjustEnd);
router.post("/p2provider/pragmatic/endround", endroundEnd);
router.post("/p2provider/pragmatic/casinogames", getCasinoGames);
router.post("/p2provider/pragmatic/casinolobbygames", getCasinoLobbyGames);
router.post(
  "/p2provider/pragmatic/launchgame",
  [tokenPipeline, launchGame] // Middleware chain
);
router.post("/p2provider/pragmatic/rounddetails", roundDetails);
router.post("/shan/player-registration", registerPlayer);
router.post("/p2provider/pragmatic/openhistext", openHistoryExt);

export default router;
