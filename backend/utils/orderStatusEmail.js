export const getOrderStatusEmailTemplate = ({
    customerName,
    orderId,
    status,
}) => {

    const statusMessages = {
        PLACED: "We have received your order and it is being processed.",
        CONFIRMED: "Your order has been confirmed by our team.",
        PACKED: "Great news! Your order has been packed and is ready to ship.",
        SHIPPED: "Your order has been shipped and is on the way 🚚",
        OUT_FOR_DELIVERY: "Your order is out for delivery 📦",
        DELIVERED: "Your order has been delivered 🎉",
        CANCELLED: "Your order has been cancelled.",
    };

    const readableStatus = status.replace(/_/g, " ");

    return {
        subject: `📦 Order ${readableStatus} | RV Gift Shop`,
        html: `
      <div style="font-family:Arial,sans-serif;background:#f4f6f8;padding:30px">
        
        <div style="max-width:600px;margin:auto;background:white;border-radius:10px;padding:30px">

          <h2 style="color:#111827;margin-bottom:10px">
            RV Gift Shop
          </h2>

          <p style="font-size:16px;color:#374151">
            Hello <b>${customerName}</b> 👋
          </p>

          <p style="color:#374151">
            ${statusMessages[status] || "Your order status has been updated."}
          </p>

          <div style="
            margin:20px 0;
            padding:15px;
            background:#f9fafb;
            border-radius:6px;
          ">
            <p><b>Order ID:</b> ${orderId}</p>
            <p><b>Status:</b> ${readableStatus}</p>
          </div>

          <div style="
            padding:20px;
            background:#ecfdf5;
            border-radius:6px;
            color:#065f46;
            font-weight:500
          ">
            Thank you for shopping with us 💝
          </div>

          <p style="margin-top:30px;font-size:13px;color:#6b7280">
            RV Gift Shop • Order Notification
          </p>

        </div>
      </div>
    `,
    };
};