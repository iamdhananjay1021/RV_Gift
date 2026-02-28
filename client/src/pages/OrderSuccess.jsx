import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // ✅ Context se token lo
import api from "../api/axios";
import { FaShoppingBag, FaClipboardList, FaWhatsapp, FaArrowRight } from "react-icons/fa";

const OrderSuccess = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // ✅ FIXED: Redux auth slice nahi hai

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userWhatsAppFromState = location.state?.userWhatsApp || null;

    useEffect(() => {
        if (!id) { navigate("/orders"); return; }
        if (!user) { navigate("/login"); return; }

        const fetchOrder = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (err) {
                console.error("FETCH ORDER ERROR:", err);
                setError("Order not found");
                setTimeout(() => navigate("/orders"), 2000);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, user, navigate]);

    /* ── Loading ── */
    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400 text-sm font-medium">Processing your order...</p>
            </div>
        </div>
    );

    /* ── Error ── */
    if (error || !order) return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center">
            <p className="text-zinc-500 font-semibold mb-2">Order not found</p>
            <p className="text-zinc-400 text-sm">Redirecting to orders...</p>
        </div>
    );

    /* ── WhatsApp link ── */
    const cleanPhone = order.phone.replace(/[^0-9]/g, "");
    const finalPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
    const userWhatsApp = userWhatsAppFromState ||
        `https://wa.me/${finalPhone}?text=${encodeURIComponent(
            `✅ ORDER CONFIRMED\n\nHi ${order.customerName},\n\nOrder ID: #${order._id.slice(-8).toUpperCase()}\nTotal: ₹${order.totalAmount}\nPayment: Cash on Delivery\nStatus: PLACED\n\nThank you for shopping with RV Gift Shop 💝`
        )}`;

    return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">

                {/* Success Card */}
                <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">

                    {/* Top gradient bar */}
                    <div className="h-2 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-400" />

                    <div className="p-8 text-center">
                        {/* Checkmark */}
                        <div className="w-20 h-20 bg-emerald-50 border-4 border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-5">
                            <span className="text-4xl">✅</span>
                        </div>

                        <h1 className="text-2xl font-black text-zinc-900 mb-1">Order Confirmed!</h1>
                        <p className="text-zinc-400 text-sm mb-6">
                            Thank you, <span className="font-bold text-zinc-700">{order.customerName}</span>! 🎉
                        </p>

                        {/* Order Info */}
                        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 mb-6 text-left space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Order ID</span>
                                <span className="font-mono font-bold text-zinc-700">#{order._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Total Amount</span>
                                <span className="font-black text-emerald-600 text-base">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Payment</span>
                                <span className="font-semibold text-zinc-700">Cash on Delivery</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-zinc-400">Status</span>
                                <span className="font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full text-xs">PLACED</span>
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="space-y-3">
                            <a
                                href={userWhatsApp}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all active:scale-95 shadow-md shadow-emerald-200"
                            >
                                <FaWhatsapp size={16} /> WhatsApp Confirmation
                            </a>

                            <Link
                                to="/orders"
                                className="flex items-center justify-center gap-2 w-full py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl transition-all active:scale-95"
                            >
                                <FaClipboardList size={14} /> View My Orders
                            </Link>

                            <Link
                                to="/"
                                className="flex items-center justify-center gap-1.5 w-full py-3 text-zinc-500 hover:text-zinc-700 font-semibold text-sm transition-colors"
                            >
                                <FaShoppingBag size={12} /> Continue Shopping <FaArrowRight size={10} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderSuccess;