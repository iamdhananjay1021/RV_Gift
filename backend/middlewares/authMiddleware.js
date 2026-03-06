import jwt from "jsonwebtoken";
import User from "../models/User.js";

let Admin;
try {
    const adminModule = await import("../models/Admin.js").catch(() => null);
    Admin = adminModule?.default || null;
} catch {
    Admin = null;
}

/* =========================
   PROTECT (LOGIN REQUIRED)
========================= */
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, token missing" });
        }

        const token = authHeader.split(" ")[1];

        // 🔐 VERIFY TOKEN
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Support both id and _id
        const userId = decoded.id || decoded._id;

        if (!userId) {
            return res.status(401).json({ message: "Invalid token payload" });
        }

        // 🔎 Search in User collection
        let user = await User.findById(userId).select("-password");

        // 🔎 If not found and Admin model exists, search Admin
        if (!user && Admin) {
            user = await Admin.findById(userId).select("-password");
        }

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user;

        console.log("AUTH USER:", {
            id: user._id,
            email: user.email,
            role: user.role,
        });

        next();

    } catch (error) {
        console.error("JWT ERROR:", error.message);
        return res.status(401).json({ message: "Not authorized, token invalid" });
    }
};


/* =========================
   ADMIN OR OWNER
========================= */
export const adminOnly = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
    }

    const allowedRoles = ["admin", "owner"];

    if (allowedRoles.includes(req.user.role)) {
        return next();
    }

    return res.status(403).json({
        message: "Access denied. Admin / Owner permission required.",
    });
};


/* =========================
   OWNER ONLY
========================= */
export const ownerOnly = (req, res, next) => {
    if (req.user?.role === "owner") return next();
    return res.status(403).json({ message: "Owner access only" });
};