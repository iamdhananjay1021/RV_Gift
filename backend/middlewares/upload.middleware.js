import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "rv-gift-products",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "avif"],
        resource_type: "image", // 🔥 CRITICAL FIX
    }),
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export default upload;