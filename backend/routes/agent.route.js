import express from "express";
import {
  // agamountdistri,
  agentLogin,
  agentLogout,
  agentRegister,
  checkAGID,
  checkAndgetAD,
  countAgent,
  distributeAgentAmount,
  distributeAmount,
  // checkPassUpdate,
  getAllAgent,
  transactionrec,
  updateAgent,
  updateAgentActiveStatus,
  updateAgentPassword,
  withdrawAgentToAgent,
  withdrawAgentToUser,
} from "../controllers/agent.controller.js";
import {
  authenticateToken,
  checkAdminAgentRole,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", agentRegister);
router.post("/login", agentLogin);
router.post("/logout", agentLogout);
router.get("/check-agid/:agid", checkAGID);
router.get(
  "/agent_dashboard",
  authenticateToken,
  checkAdminAgentRole,
  checkAndgetAD
);
router.get("/agents", authenticateToken, checkAdminAgentRole, getAllAgent);
router.put(
  "/update_password",
  authenticateToken,
  checkAdminAgentRole,
  updateAgentPassword
);

router.post("/distribute", authenticateToken, distributeAmount);
router.post("/distributeagent", authenticateToken, distributeAgentAmount);
router.post("/withdraw", authenticateToken, withdrawAgentToUser);
router.post("/withdrawagent", authenticateToken, withdrawAgentToAgent);
router.get("/transactionsrec", authenticateToken, transactionrec);
router.put(
  "/update_agent_active_status",
  authenticateToken,
  updateAgentActiveStatus
);
router.get("/agent_count", countAgent);
// Update Agent
router.put("/agents/:agid", updateAgent);

// router.get("/password_status", authenticateToken, checkPassUpdate);

export default router;
