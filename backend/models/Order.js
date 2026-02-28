import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        items: [
            {
                productId: mongoose.Schema.Types.ObjectId,
                name: String,
                price: Number,
                qty: Number,
                image: String,
            },
        ],

        customerName: String,
        phone: String,
        address: String,
        email: String,

        totalAmount: Number,

        orderStatus: {
            type: String,
            enum: [
                "PLACED",
                "CONFIRMED",
                "PACKED",
                "SHIPPED",
                "OUT_FOR_DELIVERY",
                "DELIVERED",
                "CANCELLED",
            ],
            default: "PLACED",
        },

        // 🔥 STATUS TIMESTAMPS
        statusTimeline: {
            placedAt: { type: Date, default: Date.now },
            confirmedAt: Date,
            packedAt: Date,
            shippedAt: Date,
            deliveredAt: Date,
        },

    },
    { timestamps: true }
);

export default mongoose.model("Order", orderSchema);