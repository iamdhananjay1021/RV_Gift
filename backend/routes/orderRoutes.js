import express from "express";
import {
    createOrder,
    getMyOrders,
    getAllOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

/* ================= USER ================= */
router.post("/", protect, createOrder);
router.get("/my", protect, getMyOrders);

/* ================= ADMIN ================= */
router.get("/", protect, adminOnly, getAllOrders);        // ✅ protect ADD kiya
router.put("/:id", protect, adminOnly, updateOrderStatus);

router.patch("/:id/cancel", protect, cancelOrder);

/* ================= LAST ================= */
router.get("/:id", protect, getOrderById);

export default router;