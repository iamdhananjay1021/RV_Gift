import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

        const hashedPassword = await bcrypt.hash(password, 12); // ✅ 12 rounds

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

        // ✅ Same message for security — don't reveal if email exists
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

        // ✅ Validate coordinates
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