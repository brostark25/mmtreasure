import express from "express";
import jwt from "jsonwebtoken";
import {
  getGameRounds,
  getGameRoundsHist,
  getPlayedGames,
  WinLoseRp,
  shanReport,
  createdAgents,
  createdUsers,
  getCreatedAgentsAndUsers,
  getGameRoundsFromDB
} from "../controllers/report.controller.js";
import {
  authenticateToken,
  checkAdminAgentRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/win-lose", WinLoseRp);
router.post("/histgame-rounds", getGameRoundsHist);
router.get("/game-rounds", getGameRounds);
router.get("/game-rounds-from-db", getGameRoundsFromDB);
router.post("/get-played-games", getPlayedGames);
router.post("/shan-report", shanReport);
router.get("/created-agents", authenticateToken, createdAgents);
router.get("/created-users", authenticateToken, createdUsers);
router.get("/created-agents-and-users", authenticateToken, getCreatedAgentsAndUsers);

export default router;