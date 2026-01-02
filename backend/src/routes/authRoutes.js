import express from "express";
const router = express.Router();

import {
  registerTenant,
  login,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";

router.post("/register-tenant", registerTenant);
router.post("/login", login);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/logout", authMiddleware, logout);

export default router;
