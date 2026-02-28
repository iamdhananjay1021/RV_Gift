export const getOrderStatusEmailTemplate = ({
    customerName,
    orderId,
    status,
}) => {
    const statusMessages = {
        PLACED: "We have received your order.",
        CONFIRMED: "Your order has been confirmed.",
        PACKED: "Your order has been packed.",
        SHIPPED: "Your order has been shipped 🚚",
        OUT_FOR_DELIVERY: "Your order is out for delivery 📦",
        DELIVERED: "Your order has been delivered 🎉",
        CANCELLED: "Your order has been cancelled.",
    };

    return {
        subject: `📦 Order ${status.replace(/_/g, " ")} - RV Gift Shop`,
        html: `
            <h2>Hello ${customerName} 👋</h2>
            <p><b>Order ID:</b> ${orderId}</p>
            <p>${statusMessages[status] || "Order updated."}</p>
            <p><b>Status:</b> ${status.replace(/_/g, " ")}</p>
            <br/>
            <p>Thank you for shopping with us 💝</p>
            <p><b>RV Gift Shop</b></p>
        `,
    };
};