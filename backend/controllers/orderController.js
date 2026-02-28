import Order from "../models/Order.js";
import nodemailer from "nodemailer";
import {
    generateWhatsAppLink,
    generateUserWhatsAppLink,
} from "../utils/whatsapp.js";
import { getOrderStatusEmailTemplate } from "../utils/orderStatusEmail.js";
import { adminOrderEmailHTML } from "../utils/adminOrderEmail.js";

/* =========================
   📧 EMAIL CONFIG
========================= */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/* =====================================================
   🛒 CREATE ORDER  (FINAL)
===================================================== */
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

        /* ---------- BASIC VALIDATION ---------- */
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        if (!customerName || !phone || !address) {
            return res.status(400).json({
                message: "Customer details missing",
            });
        }

        /* ---------- NORMALIZE ITEMS ---------- */
        const formattedItems = items.map((item) => {
            let finalImage = "";

            if (typeof item.image === "string") {
                finalImage = item.image;
            } else if (item.images && item.images.length > 0) {
                finalImage =
                    item.images[0].url ||
                    item.images[0] ||
                    "";
            } else {
                finalImage =
                    "https://via.placeholder.com/150?text=Product";
            }

            return {
                productId: item.productId || item._id,
                name: item.name || "Product",
                price: Number(item.price || 0),
                qty: Number(item.qty || item.quantity || 1),
                image: finalImage,
            };
        });

        /* ---------- CREATE ORDER ---------- */
        const order = new Order({
            user: req.user._id, // from auth middleware
            items: formattedItems,
            customerName,
            phone,
            address,
            email,
            latitude,
            longitude,
            totalAmount: Number(totalAmount),
            orderStatus: "PLACED",
            statusTimeline: {
                placedAt: new Date(),
            },
        });

        const savedOrder = await order.save();

        /* ---------- FAST RESPONSE TO USER ---------- */
        res.status(201).json({
            success: true,
            orderId: savedOrder._id,
            orderStatus: savedOrder.orderStatus,
            adminWhatsApp: generateWhatsAppLink(savedOrder),
            userWhatsApp: generateUserWhatsAppLink(
                savedOrder,
                "PLACED"
            ),
        });

        /* ---------- EMAILS (NON BLOCKING) ---------- */
        try {
            const userMail = getOrderStatusEmailTemplate({
                customerName,
                orderId: savedOrder._id,
                status: "PLACED",
            });

            const adminMailHTML = adminOrderEmailHTML({
                order: savedOrder,
            });

            // 📩 User Email
            if (email) {
                transporter
                    .sendMail({
                        from: `"RV Gift Shop" <${process.env.EMAIL_USER}>`,
                        to: email,
                        subject: userMail.subject,
                        html: userMail.html,
                    })
                    .catch((err) =>
                        console.log("User email failed:", err.message)
                    );
            }

            // 📩 Admin Email
            transporter
                .sendMail({
                    from: `"Order Bot" <${process.env.EMAIL_USER}>`,
                    to: process.env.ADMIN_EMAIL,
                    subject: `🛒 New Order ₹${totalAmount}`,
                    html: adminMailHTML,
                })
                .catch((err) =>
                    console.log("Admin email failed:", err.message)
                );
        } catch (mailError) {
            console.error("Email process error:", mailError.message);
        }
    } catch (error) {
        console.error("❌ CREATE ORDER ERROR:", error);
        res.status(500).json({
            message: "Order placement failed",
        });
    }
};
/* =====================================================
    📦 GET MY ORDERS
===================================================== */
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }); //
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

/* =====================================================
    🔍 GET ORDER BY ID
===================================================== */
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id); //
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Error fetching order" });
    }
};

/* =====================================================
    🔄 UPDATE ORDER STATUS (ADMIN)
===================================================== */
export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const update = { orderStatus: status };

        if (status === "CONFIRMED") update["statusTimeline.confirmedAt"] = new Date();
        if (status === "PACKED") update["statusTimeline.packedAt"] = new Date();
        if (status === "SHIPPED") update["statusTimeline.shippedAt"] = new Date();
        if (status === "DELIVERED") update["statusTimeline.deliveredAt"] = new Date();

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: update },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        /* =========================
           📧 SEND STATUS EMAILS
        ========================= */
        try {
            const userMail = getOrderStatusEmailTemplate({
                customerName: order.customerName,
                orderId: order._id,
                status,
            });

            const adminMailHTML = adminOrderEmailHTML({ order });

            // 📩 USER EMAIL
            if (order.email) {
                transporter.sendMail({
                    from: `"RV Gift Shop" <${process.env.EMAIL_USER}>`,
                    to: order.email,
                    subject: userMail.subject,
                    html: userMail.html,
                });
            }

            // 📩 ADMIN EMAIL
            transporter.sendMail({
                from: `"Order Bot" <${process.env.EMAIL_USER}>`,
                to: process.env.ADMIN_EMAIL,
                subject: `📦 Order ${status} | #${order._id.toString().slice(-6)}`,
                html: adminMailHTML,
            });
        } catch (mailErr) {
            console.error("❌ Status mail error:", mailErr.message);
        }

        res.json(order);
    } catch (error) {
        console.error("❌ Update order status error:", error);
        res.status(500).json({ message: "Failed to update order status" });
    }
};

/* =====================================================
    🧾 GET ALL ORDERS (ADMIN)
===================================================== */
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }); //
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all orders" });
    }
};