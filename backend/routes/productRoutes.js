import express from "express";
import {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getRelatedProducts
} from "../controllers/productController.js";

import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

/* ===== PUBLIC ===== */
router.get("/", getAllProducts);
router.get("/:id", getSingleProduct);
router.get("/:id/related", getRelatedProducts);


/* ===== ADMIN ===== */
router.post(
    "/",
    protect,
    adminOnly,
    upload.array("images", 5),
    createProduct
);

router.put(
    "/:id",
    protect,
    adminOnly,
    upload.array("images", 5),
    updateProduct
);

router.delete(
    "/:id",
    protect,
    adminOnly,
    deleteProduct
);
// routes/product.routes.js

export default router;