import express from "express";
import {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ================= USER ================= */

// CREATE ORDER
router.post("/", protect, createOrder);

// GET MY ORDERS
router.get("/my", protect, getMyOrders);

/* ================= ADMIN / OWNER ================= */

// GET ALL ORDERS  ✅ MUST BE BEFORE `/:id`
router.get("/", protect, adminOnly, getAllOrders);

// UPDATE ORDER STATUS
router.put("/:id", protect, adminOnly, updateOrderStatus);

/* ================= USER / ADMIN ================= */

// GET SINGLE ORDER  ✅ ALWAYS LAST
router.get("/:id", protect, getOrderById);

export default router;