import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders } from "../features/orders/orderSlice";
import { FaBoxOpen, FaSync, FaShoppingBag, FaArrowRight, FaCheckCircle, FaTruck, FaBox, FaTimesCircle } from "react-icons/fa";
import api from "../api/axios";

const STATUS_CONFIG = {
    PLACED: { label: "Order Placed", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-200", dot: "bg-yellow-400", icon: "🛒" },
    CONFIRMED: { label: "Confirmed", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400", icon: "✅" },
    PACKED: { label: "Packed", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", dot: "bg-indigo-400", icon: "📦" },
    SHIPPED: { label: "Shipped", color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", dot: "bg-purple-400", icon: "🚚" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", dot: "bg-orange-400", icon: "🏃" },
    DELIVERED: { label: "Delivered", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500", icon: "🎉" },
    CANCELLED: { label: "Cancelled", color: "text-red-500", bg: "bg-red-50", border: "border-red-200", dot: "bg-red-400", icon: "❌" },
};

const FLOW = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"];
const CANCELLABLE = ["PLACED", "CONFIRMED"];
const getItemImage = (item) => item.images?.[0]?.url || item.image || null;

const MyOrders = () => {
    const dispatch = useDispatch();
    const { orders = [], status, error } = useSelector(state => state.orders);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState("ALL");
    const [cancellingId, setCancellingId] = useState(null);
    const [confirmCancelId, setConfirmCancelId] = useState(null);

    useEffect(() => { dispatch(getMyOrders()); }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(getMyOrders());
        setRefreshing(false);
    };

    const handleCancel = async (orderId) => {
        try {
            setCancellingId(orderId);
            await api.patch(`/orders/${orderId}/cancel`);
            dispatch(getMyOrders());
            setConfirmCancelId(null);
        } catch (err) {
            alert(err.response?.data?.message || "Cancel failed");
        } finally {
            setCancellingId(null);
        }
    };

    const filtered = activeFilter === "ALL" ? orders : orders.filter(o => o.orderStatus === activeFilter);

    if (status === "loading" && !refreshing) return (
        <div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400 text-sm font-medium">Loading your orders...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen py-6 px-4" style={{ background: "#f1f3f6", fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');`}</style>

            <div className="max-w-4xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-4 items-start">

                    {/* LEFT SIDEBAR */}
                    <div className="w-full lg:w-64 shrink-0 space-y-3">

                        {/* Profile card */}
                        <div className="bg-white rounded-sm border border-stone-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-lg font-black shadow-sm">
                                    📦
                                </div>
                                <div>
                                    <p className="font-bold text-zinc-800 text-sm">My Orders</p>
                                    <p className="text-xs text-zinc-400">{orders.length} total orders</p>
                                </div>
                            </div>
                        </div>

                        {/* Filter sidebar */}
                        <div className="bg-white rounded-sm border border-stone-200 overflow-hidden">
                            <div className="px-4 py-3 border-b border-stone-100">
                                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">Filter Orders</p>
                            </div>
                            <div className="py-1">
                                <button onClick={() => setActiveFilter("ALL")}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${activeFilter === "ALL" ? "bg-blue-50 text-blue-600 border-l-2 border-blue-500" : "text-zinc-600 hover:bg-stone-50"}`}>
                                    <span>All Orders</span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeFilter === "ALL" ? "bg-blue-100 text-blue-600" : "bg-stone-100 text-zinc-500"}`}>
                                        {orders.length}
                                    </span>
                                </button>
                                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                                    const count = orders.filter(o => o.orderStatus === key).length;
                                    if (count === 0) return null;
                                    return (
                                        <button key={key} onClick={() => setActiveFilter(key)}
                                            className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold transition-colors ${activeFilter === key ? "bg-blue-50 text-blue-600 border-l-2 border-blue-500" : "text-zinc-600 hover:bg-stone-50"}`}>
                                            <span className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${activeFilter === key ? "bg-blue-100 text-blue-600" : "bg-stone-100 text-zinc-500"}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT MAIN */}
                    <div className="flex-1 min-w-0 w-full space-y-3">

                        {/* Header */}
                        <div className="bg-white rounded-sm border border-stone-200 px-5 py-3 flex items-center justify-between">
                            <h1 className="font-black text-zinc-900 text-base">
                                {activeFilter === "ALL" ? "All Orders" : STATUS_CONFIG[activeFilter]?.label}
                                <span className="ml-2 text-zinc-400 font-normal text-sm">({filtered.length})</span>
                            </h1>
                            <button onClick={handleRefresh} disabled={refreshing}
                                className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold hover:text-amber-600 transition-colors cursor-pointer disabled:opacity-50">
                                <FaSync size={10} className={refreshing ? "animate-spin" : ""} />
                                {refreshing ? "Refreshing..." : "Refresh"}
                            </button>
                        </div>

                        {/* Error */}
                        {status === "failed" && error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-sm text-sm">⚠️ {error}</div>
                        )}

                        {/* Empty */}
                        {orders.length === 0 && status === "succeeded" && (
                            <div className="bg-white rounded-sm border border-stone-200 p-16 text-center">
                                <FaShoppingBag size={48} className="text-stone-200 mx-auto mb-4" />
                                <p className="text-zinc-600 font-bold text-lg mb-1">No orders yet!</p>
                                <p className="text-zinc-400 text-sm mb-6">Looks like you haven't placed any orders.</p>
                                <Link to="/"
                                    className="inline-flex items-center gap-2 px-8 py-3 bg-amber-500 text-white rounded-sm font-bold text-sm hover:bg-amber-600 transition-all active:scale-95">
                                    Start Shopping <FaArrowRight size={11} />
                                </Link>
                            </div>
                        )}

                        {/* Filter Empty */}
                        {orders.length > 0 && filtered.length === 0 && (
                            <div className="bg-white rounded-sm border border-stone-200 p-12 text-center">
                                <FaBoxOpen size={32} className="text-stone-300 mx-auto mb-3" />
                                <p className="text-zinc-500 font-semibold">No {STATUS_CONFIG[activeFilter]?.label} orders</p>
                                <button onClick={() => setActiveFilter("ALL")}
                                    className="mt-3 text-xs text-blue-600 font-bold hover:underline cursor-pointer">
                                    View all orders
                                </button>
                            </div>
                        )}

                        {/* Orders */}
                        {filtered.map(order => {
                            const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED;
                            const canCancel = CANCELLABLE.includes(order.orderStatus);
                            const stepIdx = FLOW.indexOf(order.orderStatus);
                            const isCancelled = order.orderStatus === "CANCELLED";
                            const isDelivered = order.orderStatus === "DELIVERED";

                            return (
                                <div key={order._id} className="bg-white rounded-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow duration-200">

                                    {/* Order header bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-stone-50 border-b border-stone-100">
                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            <div>
                                                <p className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-0.5">Order ID</p>
                                                <p className="font-mono font-bold text-zinc-700">#{order._id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <div>
                                                <p className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-0.5">Placed On</p>
                                                <p className="font-semibold text-zinc-600">
                                                    {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-black text-[10px] uppercase tracking-widest text-zinc-400 mb-0.5">Total</p>
                                                <p className="font-black text-zinc-800">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                                            </div>
                                        </div>
                                        <Link to={`/orders/${order._id}`}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors">
                                            View Details <FaArrowRight size={8} />
                                        </Link>
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-stone-50">
                                        {order.items?.map((item, idx) => {
                                            const img = getItemImage(item);
                                            return (
                                                <div key={idx} className="px-5 py-4 flex gap-4 items-start">
                                                    {/* Image */}
                                                    <div className="w-20 h-20 rounded border border-stone-100 bg-stone-50 overflow-hidden flex items-center justify-center shrink-0">
                                                        {img
                                                            ? <img src={img} alt={item.name} className="w-full h-full object-contain p-1.5"
                                                                onError={e => { e.target.style.display = "none"; }} />
                                                            : <FaBoxOpen size={20} className="text-stone-300" />
                                                        }
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-zinc-800 text-sm line-clamp-2 leading-snug">{item.name}</p>
                                                        <p className="text-xs text-zinc-400 mt-0.5">Qty: {item.qty || item.quantity || 1} × ₹{item.price?.toLocaleString("en-IN")}</p>
                                                        {item.customization?.text && (
                                                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                                                ✏️ {item.customization.text}
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Status — Flipkart style */}
                                                    <div className="text-right shrink-0">
                                                        {isCancelled ? (
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <span className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                                                </span>
                                                                <p className="text-sm font-bold text-red-500">Cancelled</p>
                                                            </div>
                                                        ) : isDelivered ? (
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <FaCheckCircle size={14} className="text-emerald-500" />
                                                                <p className="text-sm font-bold text-emerald-600">Delivered</p>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-1.5 justify-end">
                                                                <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot} animate-pulse`} />
                                                                <p className={`text-sm font-bold ${cfg.color}`}>{cfg.label}</p>
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-zinc-400 mt-0.5 font-semibold">
                                                            ₹{((item.qty || item.quantity || 1) * item.price)?.toLocaleString("en-IN")}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Progress tracker — Flipkart style */}
                                    {!isCancelled && (
                                        <div className="px-5 py-4 border-t border-stone-100 bg-stone-50/50">
                                            <div className="flex items-center">
                                                {FLOW.map((step, i) => (
                                                    <div key={step} className="flex items-center flex-1">
                                                        <div className="flex flex-col items-center">
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${i <= stepIdx ? "bg-amber-500" : "bg-stone-200"
                                                                }`}>
                                                                {i < stepIdx
                                                                    ? <FaCheckCircle size={12} className="text-white" />
                                                                    : i === stepIdx
                                                                        ? <span className="w-2.5 h-2.5 rounded-full bg-white" />
                                                                        : <span className="w-2 h-2 rounded-full bg-stone-300" />
                                                                }
                                                            </div>
                                                            <p className={`text-[9px] font-bold mt-1 text-center whitespace-nowrap ${i <= stepIdx ? "text-amber-600" : "text-zinc-300"}`}
                                                                style={{ fontSize: "9px" }}>
                                                                {STATUS_CONFIG[step]?.label.split(" ")[0]}
                                                            </p>
                                                        </div>
                                                        {i < FLOW.length - 1 && (
                                                            <div className="flex-1 h-0.5 mx-1 rounded-full overflow-hidden bg-stone-200">
                                                                <div className={`h-full rounded-full transition-all duration-500 ${i < stepIdx ? "bg-amber-400 w-full" : "w-0"}`} />
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Cancel */}
                                    {canCancel && (
                                        <div className="px-5 py-3 border-t border-stone-100 flex items-center justify-end gap-2">
                                            {confirmCancelId === order._id ? (
                                                <>
                                                    <span className="text-xs text-zinc-500 font-medium">Cancel this order?</span>
                                                    <button onClick={() => handleCancel(order._id)} disabled={cancellingId === order._id}
                                                        className="px-4 py-1.5 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600 transition cursor-pointer disabled:opacity-60">
                                                        {cancellingId === order._id ? "Cancelling..." : "Yes, Cancel"}
                                                    </button>
                                                    <button onClick={() => setConfirmCancelId(null)}
                                                        className="px-4 py-1.5 bg-stone-100 text-zinc-600 text-xs font-bold rounded hover:bg-stone-200 transition cursor-pointer">
                                                        No, Keep
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={() => setConfirmCancelId(order._id)}
                                                    className="text-xs text-red-500 font-bold border border-red-200 px-4 py-1.5 rounded hover:bg-red-50 transition cursor-pointer">
                                                    Cancel Order
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyOrders;