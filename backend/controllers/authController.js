// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// /* ===============================
//    JWT GENERATOR
// ================================ */
// const generateToken = (id, role) =>
//     jwt.sign(
//         { id, role },
//         process.env.JWT_SECRET,
//         { expiresIn: "7d" }
//     );

// /* ===============================
//    REGISTER (NORMAL USER ONLY)
// ================================ */
// export const register = async (req, res) => {
//     try {
//         const { name, email, password } = req.body;

//         // 1️⃣ Basic validation
//         if (!name || !email || !password) {
//             return res.status(400).json({
//                 message: "All fields required",
//             });
//         }

//         // 2️⃣ Email uniqueness check
//         const exists = await User.findOne({ email });
//         if (exists) {
//             return res.status(400).json({
//                 message: "User already exists",
//             });
//         }

//         // 3️⃣ Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // 4️⃣ Create user (role FORCE = user)
//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             role: "user",
//         });

//         // 5️⃣ Response (flat, frontend-friendly)
//         return res.status(201).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             token: generateToken(user._id, user.role),
//         });
//     } catch (error) {
//         console.error("REGISTER ERROR:", error);
//         return res.status(500).json({
//             message: "Server error",
//         });
//     }
// };

// /* ===============================
//    LOGIN (USER + ADMIN + OWNER)
// ================================ */
// export const login = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // 1️⃣ Validation
//         if (!email || !password) {
//             return res.status(400).json({
//                 message: "Email & password required",
//             });
//         }

//         // 2️⃣ Find user
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).json({
//                 message: "Invalid credentials",
//             });
//         }

//         // 3️⃣ Password match
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).json({
//                 message: "Invalid credentials",
//             });
//         }

//         // 4️⃣ Role whitelist (future-proof)
//         if (!["user", "admin", "owner"].includes(user.role)) {
//             return res.status(403).json({
//                 message: "Access denied",
//             });
//         }

//         // 5️⃣ Success response (flat)
//         return res.status(200).json({
//             _id: user._id,
//             name: user.name,
//             email: user.email,
//             role: user.role,
//             token: generateToken(user._id, user.role),
//         });
//     } catch (error) {
//         console.error("LOGIN ERROR:", error);
//         return res.status(500).json({
//             message: "Server error",
//         });
//     }
// };



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
   REGISTER (NORMAL USER ONLY)
================================ */
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields required" });
        }

        const exists = await User.findOne({ email: email.toLowerCase().trim() });
        if (exists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: "user", // 🔒 forced
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
   LOGIN (USER + ADMIN + OWNER)
================================ */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email & password required" });
        }

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!["user", "admin", "owner"].includes(user.role)) {
            return res.status(403).json({ message: "Access denied" });
        }

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
   GET PROFILE (PROTECTED)
================================ */
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.error("PROFILE ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
};