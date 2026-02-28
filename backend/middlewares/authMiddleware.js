import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

            // ❗ VERY IMPORTANT: decoded.id must exist
            if (!decoded?.id) {
                return res
                    .status(401)
                    .json({ message: "Invalid token payload" });
            }

            // 👤 FETCH USER
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return res
                    .status(401)
                    .json({ message: "User not found" });
            }

            // ✅ ATTACH USER
            req.user = user;

            console.log("AUTH USER:", {
                id: user._id,
                email: user.email,
                role: user.role,
            });

            next();
        } catch (error) {
            console.error("JWT ERROR:", error.message);
            return res
                .status(401)
                .json({ message: "Not authorized, token invalid" });
        }
    } else {
        return res
            .status(401)
            .json({ message: "Not authorized, token missing" });
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