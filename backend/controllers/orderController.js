import Order from "../models/Order.js";
import { sendEmail } from "../utils/emailService.js";
import {
    generateWhatsAppLink,
    generateUserWhatsAppLink,
} from "../utils/whatsapp.js";
import { getOrderStatusEmailTemplate } from "../utils/orderStatusEmail.js";
import { adminOrderEmailHTML } from "../utils/adminOrderEmail.js";

/* =========================
   🛒 CREATE ORDER
========================= */
export const createOrder = async (req, res) => {
    try {
        const {
            items,
            customerName,
            phone,
            address,
            email,
            totalAmount,
            latitude,
            longitude,
        } = req.body;

        // ── Validation ──
        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ message: "Cart is empty" });

        if (!customerName?.trim() || !phone?.trim() || !address?.trim())
            return res.status(400).json({ message: "Customer details missing" });

        if (!/^[6-9]\d{9}$/.test(phone.trim()))
            return res.status(400).json({ message: "Invalid phone number" });

        if (!totalAmount || Number(totalAmount) <= 0)
            return res.status(400).json({ message: "Invalid total amount" });

        if (items.length > 20)
            return res.status(400).json({ message: "Too many items in cart" });

        // ── Format Items ──
        const formattedItems = items.map((item) => {
            let finalImage = "";
            if (typeof item.image === "string" && item.image) {
                finalImage = item.image;
            } else if (Array.isArray(item.images) && item.images.length > 0) {
                finalImage = item.images[0]?.url || item.images[0] || "";
            }

            return {
                productId: item.productId || item._id,
                name: String(item.name || "Product").slice(0, 200),
                price: Math.max(0, Number(item.price || 0)),
                qty: Math.min(Math.max(1, Number(item.qty || item.quantity || 1)), 100),
                image: finalImage,
                customization: {
                    text: String(item.customization?.text || "").trim().slice(0, 500),
                    imageUrl: String(item.customization?.imageUrl || "").trim().slice(0, 1000),
                    note: String(item.customization?.note || "").trim().slice(0, 1000),
                },
            };
        });

        // ── Save Order ──
        const order = new Order({
            user: req.user._id,
            items: formattedItems,
            customerName: customerName.trim().slice(0, 100),
            phone: phone.trim(),
            address: address.trim().slice(0, 500),
            email: email?.trim().toLowerCase().slice(0, 200) || "",
            latitude: latitude ? Number(latitude) : undefined,
            longitude: longitude ? Number(longitude) : undefined,
            totalAmount: Number(totalAmount),
            orderStatus: "PLACED",
            statusTimeline: { placedAt: new Date() },
        });

        const savedOrder = await order.save();

        // ── Response first ──
        res.status(201).json({
            success: true,
            orderId: savedOrder._id,
            orderStatus: savedOrder.orderStatus,
            adminWhatsApp: generateWhatsAppLink(savedOrder),
            userWhatsApp: generateUserWhatsAppLink(savedOrder, "PLACED"),
        });

        // ── Emails (non-blocking) ──
        const userMail = getOrderStatusEmailTemplate({
            customerName: customerName.trim(),
            orderId: savedOrder._id,
            status: "PLACED",
        });

        // User ko mail — sirf agar email diya ho
        if (email?.trim()) {
            sendEmail({
                to: email.trim(),
                subject: userMail.subject,
                html: userMail.html,
                label: "User/NewOrder",
            });
        }

        // Admin ko new order notification
        sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `🛒 New Order #${savedOrder._id.toString().slice(-6).toUpperCase()} — ₹${totalAmount}`,
            html: adminOrderEmailHTML({ order: savedOrder }),
            label: "Admin/NewOrder",
        });

    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        res.status(500).json({ message: "Order placement failed. Please try again." });
    }
};

/* =========================
   ❌ CANCEL ORDER (USER)
========================= */
export const cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        // ── Auth check ──
        if (order.user.toString() !== req.user._id.toString())
            return res.status(403).json({ message: "Not authorized" });

        // ── Status check ──
        if (order.orderStatus === "CANCELLED")
            return res.status(400).json({ message: "Order is already cancelled" });

        const cancellableStatuses = ["PLACED", "CONFIRMED"];
        if (!cancellableStatuses.includes(order.orderStatus))
            return res.status(400).json({
                message: `Cannot cancel — order is already ${order.orderStatus.toLowerCase().replace(/_/g, " ")}`,
            });

        // ── Update ──
        order.orderStatus = "CANCELLED";
        order.cancellationReason = String(req.body?.reason || "Cancelled by customer").trim().slice(0, 500);

        const existingTimeline = order.statusTimeline?.toObject
            ? order.statusTimeline.toObject()
            : { ...order.statusTimeline };

        order.statusTimeline = { ...existingTimeline, cancelledAt: new Date() };
        order.markModified("statusTimeline");

        await order.save();

        // ── Response first ──
        res.json({ success: true, message: "Order cancelled successfully", order });

        // ── Emails (non-blocking) ──
        const cancelMail = getOrderStatusEmailTemplate({
            customerName: order.customerName,
            orderId: order._id,
            status: "CANCELLED",
        });

        if (order.email) {
            sendEmail({
                to: order.email,
                subject: cancelMail.subject,
                html: cancelMail.html,
                label: "User/Cancel",
            });
        }

        sendEmail({
            to: process.env.ADMIN_EMAIL,
            subject: `❌ Order Cancelled #${order._id.toString().slice(-6).toUpperCase()} — ${order.customerName}`,
            html: adminOrderEmailHTML({ order }),
            label: "Admin/Cancel",
        });

    } catch (error) {
        console.error("CANCEL ORDER ERROR:", error);
        res.status(500).json({ message: "Failed to cancel order" });
    }
};

/* =========================
   📦 GET MY ORDERS (USER)
========================= */
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean();

        res.json(orders);
    } catch (error) {
        console.error("GET MY ORDERS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

/* =========================
   🔍 GET ORDER BY ID
========================= */
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).lean();

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        const isOwner = order.user?.toString() === req.user._id.toString();
        const isAdmin = ["admin", "owner"].includes(req.user.role);

        if (!isOwner && !isAdmin)
            return res.status(403).json({ message: "Access denied" });

        res.json(order);
    } catch (error) {
        console.error("GET ORDER BY ID ERROR:", error);
        res.status(500).json({ message: "Error fetching order" });
    }
};

/* =========================
   🔄 UPDATE ORDER STATUS (ADMIN)
========================= */
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = [
            "PLACED", "CONFIRMED", "PACKED",
            "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
        ];

        if (!validStatuses.includes(status))
            return res.status(400).json({ message: "Invalid status value" });

        // ── Build update ──
        const update = { orderStatus: status };
        const timelineMap = {
            CONFIRMED: "confirmedAt",
            PACKED: "packedAt",
            SHIPPED: "shippedAt",
            DELIVERED: "deliveredAt",
            CANCELLED: "cancelledAt",
        };
        if (timelineMap[status]) {
            update[`statusTimeline.${timelineMap[status]}`] = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: update },
            { new: true, runValidators: true }
        );

        if (!order)
            return res.status(404).json({ message: "Order not found" });

        res.json(order);

        // ── User email only (admin ne khud status change kiya) ──
        if (order.email) {
            const statusMail = getOrderStatusEmailTemplate({
                customerName: order.customerName,
                orderId: order._id,
                status,
            });

            sendEmail({
                to: order.email,
                subject: statusMail.subject,
                html: statusMail.html,
                label: `User/Status-${status}`,
            });
        }

    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};

/* =========================
   🧾 GET ALL ORDERS (ADMIN)
========================= */
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .sort({ createdAt: -1 })
            .lean();

        res.json(orders);
    } catch (error) {
        console.error("GET ALL ORDERS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
};