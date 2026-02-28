import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected
router.get("/profile", protect, getProfile);

export default router;