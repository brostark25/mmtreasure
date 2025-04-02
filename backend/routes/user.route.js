import express from "express";
import { connectToDatabase } from "../config/db.js";
import jwt from "jsonwebtoken";
import {
  checkUID,
  checkUser,
  countUser,
  getAllUser,
  updateUser,
  updateUserActiveStatus,
  updateUserPassword,
  userLogin,
  userLogout,
  userRegister,
} from "../controllers/user.controller.js";

const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"

  try {
    // Ensure the token is signed with the correct secret and check expiry
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.u; // Assign user ID to request object
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/users", verifyToken, getAllUser);
router.get("/uhome", verifyToken, checkUser);
router.post("/logout", userLogout);
router.get("/check-uid/:uid", checkUID);
router.put("/update_upassword", verifyToken, updateUserPassword);
router.put("/update_user_active_status", verifyToken, updateUserActiveStatus);
router.get("/user_count", countUser);
router.put("/update/:uid", updateUser);

export default router;
