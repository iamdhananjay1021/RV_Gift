import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Admin model bhi import karo — adjust path as per your project
// Agar aapka Admin alag model hai toh yeh use hoga
let Admin;
try {
    // Dynamic import — agar Admin model exist karta hai toh use karo
    const adminModule = await import("../models/Admin.js").catch(() => null);
    Admin = adminModule?.default || null;
} catch {
    Admin = null;
}

/* =========================
   PROTECT (LOGIN REQUIRED)
========================= */
export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            // 🔐 VERIFY TOKEN
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (!decoded?.id) {
                return res.status(401).json({ message: "Invalid token payload" });
            }

            // ✅ PEHLE User model mein dhundo
            let user = await User.findById(decoded.id).select("-password");

            // ✅ Agar User mein nahi mila AUR Admin model exist karta hai
            // toh Admin model mein dhundo
            if (!user && Admin) {
                user = await Admin.findById(decoded.id).select("-password");
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
    } else {
        return res.status(401).json({ message: "Not authorized, token missing" });
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