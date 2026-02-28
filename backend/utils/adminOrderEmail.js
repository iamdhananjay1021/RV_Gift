// backend/utils/adminOrderEmail.js

export const adminOrderEmailHTML = ({ order }) => `
<div style="font-family: Arial, sans-serif; background:#f5f7fa; padding:30px">
  <div style="max-width:600px; margin:auto; background:#ffffff; padding:30px; border-radius:8px">
    
    <h2 style="color:#111827; margin-bottom:10px">
      🛒 New Order Received
    </h2>

    <p style="color:#374151; font-size:15px">
      A new order has been placed on <b>RV Gift Shop</b>.
    </p>

    <hr style="margin:20px 0"/>

    <p><b>Order ID:</b> ${order?._id || "N/A"}</p>
    <p><b>Customer:</b> ${order?.customerName || "N/A"}</p>
    <p><b>Phone:</b> ${order?.phone || "N/A"}</p>
    <p><b>Total Amount:</b> ₹${Number(order?.totalAmount || 0).toLocaleString("en-IN")}</p>
    <p><b>Payment Method:</b> Cash on Delivery</p>
    <p><b>Status:</b> Order Received (Pending Confirmation)</p>

    <hr style="margin:20px 0"/>

    <p style="margin-bottom:25px; color:#374151">
      Please review and confirm this order from the admin dashboard.
    </p>

    <a href="${process.env.ADMIN_DASHBOARD_URL || "#"}"
       style="
         display:inline-block;
         padding:14px 22px;
         background:#111827;
         color:#ffffff;
         text-decoration:none;
         border-radius:6px;
         font-weight:bold;
       ">
       🔐 Open Admin Dashboard
    </a>

    <p style="margin-top:30px; font-size:13px; color:#6b7280">
      RV Gift Shop • Admin Notification
    </p>

  </div>
</div>
`;