import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sendEmail } from "../utils/emailService.js";

/* ===============================
   JWT GENERATOR
================================ */
const generateToken = (id, role) =>
    jwt.sign(
        { id, role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

/* ===============================
   REGISTER
================================ */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name?.trim() || !email?.trim() || !password?.trim())
            return res.status(400).json({ message: "All fields required" });

        if (password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "user",
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
   LOGIN
================================ */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim() || !password?.trim())
            return res.status(400).json({ message: "Email & password required" });

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if (!user)
            return res.status(401).json({ message: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ message: "Invalid credentials" });

        if (!["user", "admin", "owner"].includes(user.role))
            return res.status(403).json({ message: "Access denied" });

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
   GET PROFILE
================================ */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        console.error("PROFILE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/* ===============================
   SAVE LOCATION
================================ */
export const saveLocation = async (req, res) => {
    try {
        const { userId, latitude, longitude, city, state } = req.body;

        if (!userId)
            return res.status(400).json({ message: "userId required" });

        if (latitude && (latitude < -90 || latitude > 90))
            return res.status(400).json({ message: "Invalid latitude" });

        if (longitude && (longitude < -180 || longitude > 180))
            return res.status(400).json({ message: "Invalid longitude" });

        await User.findByIdAndUpdate(userId, {
            $set: {
                "location.latitude": latitude,
                "location.longitude": longitude,
                "location.city": city?.trim(),
                "location.state": state?.trim(),
                "location.updatedAt": new Date(),
            },
        });

        res.json({ success: true });
    } catch (error) {
        console.error("SAVE LOCATION ERROR:", error);
        res.status(500).json({ message: "Failed to save location" });
    }
};

/* ===============================
   GET ALL USERS (ADMIN)
================================ */
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
            .select("-password")
            .sort({ createdAt: -1 })
            .lean();
        res.json(users);
    } catch (error) {
        console.error("GET ALL USERS ERROR:", error);
        res.status(500).json({ message: "Failed to fetch users" });
    }
};

/* ===============================
   FORGOT PASSWORD
================================ */
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email?.trim())
            return res.status(400).json({ message: "Email is required" });

        const user = await User.findOne({ email: email.toLowerCase().trim() });

        // ✅ Same response even if user not found — security
        if (!user) {
            return res.json({
                success: true,
                message: "If this email exists, a reset link has been sent",
            });
        }

        // ── Generate reset token ──
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save({ validateBeforeSave: false });

        // ── Send email ──
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const html = `
            <div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:30px">
                <div style="max-width:520px; margin:auto; background:#ffffff; padding:30px; border-radius:12px; border:1px solid #e5e7eb">
                    <div style="text-align:center; margin-bottom:24px">
                        <div style="width:56px; height:56px; background:#f59e0b; border-radius:14px; display:inline-flex; align-items:center; justify-content:center; font-size:28px">🎁</div>
                    </div>
                    <h2 style="color:#111827; text-align:center; margin-bottom:8px">Reset Your Password</h2>
                    <p style="color:#6b7280; text-align:center; font-size:14px; margin-bottom:24px">
                        We received a request to reset your password for your RV Gift Shop account.
                    </p>
                    <div style="text-align:center; margin-bottom:24px">
                        <a href="${resetUrl}"
                            style="display:inline-block; padding:14px 28px; background:#f59e0b; color:#ffffff; text-decoration:none; border-radius:10px; font-weight:bold; font-size:15px">
                            🔑 Reset Password
                        </a>
                    </div>
                    <p style="color:#9ca3af; font-size:12px; text-align:center; margin-bottom:8px">
                        This link will expire in <strong>15 minutes</strong>.
                    </p>
                    <p style="color:#9ca3af; font-size:12px; text-align:center">
                        If you didn't request this, you can safely ignore this email.
                    </p>
                    <hr style="margin:24px 0; border:none; border-top:1px solid #f3f4f6"/>
                    <p style="color:#d1d5db; font-size:11px; text-align:center">RV Gift Shop • Security Notification</p>
                </div>
            </div>
        `;

        await sendEmail({
            to: user.email,
            subject: "🔑 Reset Your Password — RV Gift Shop",
            html,
            label: "Auth/ForgotPassword",
        });

        res.json({
            success: true,
            message: "If this email exists, a reset link has been sent",
        });

    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};

/* ===============================
   RESET PASSWORD
================================ */
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!token || !password?.trim())
            return res.status(400).json({ message: "Token and new password required" });

        if (password.length < 6)
            return res.status(400).json({ message: "Password must be at least 6 characters" });

        // ── Hash token and find user ──
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user)
            return res.status(400).json({ message: "Invalid or expired reset link" });

        // ── Update password ──
        user.password = await bcrypt.hash(password, 12);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.json({
            success: true,
            message: "Password reset successfully. You can now login.",
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};