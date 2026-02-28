import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders } from "../features/orders/orderSlice";
import { FaBoxOpen, FaSync, FaShoppingBag, FaArrowRight } from "react-icons/fa";

const STATUS_CONFIG = {
    PLACED: { label: "Placed", color: "bg-yellow-50 text-yellow-700 border-yellow-200", dot: "bg-yellow-400" },
    CONFIRMED: { label: "Confirmed", color: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-400" },
    PACKED: { label: "Packed", color: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-400" },
    SHIPPED: { label: "Shipped", color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-400" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-400" },
    DELIVERED: { label: "Delivered", color: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
    CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-400" },
};

// ✅ FIX: correct image resolver — same as Cart.jsx
const getItemImage = (item) =>
    item.images?.[0]?.url || item.image || null;

const MyOrders = () => {
    const dispatch = useDispatch();
    const { orders = [], status, error } = useSelector(state => state.orders);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        dispatch(getMyOrders());
    }, [dispatch]);

    const handleRefresh = async () => {
        setRefreshing(true);
        await dispatch(getMyOrders());
        setRefreshing(false);
    };

    if (status === "loading" && !refreshing) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-400 text-sm font-medium">Loading your orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900">My Orders</h1>
                        <p className="text-zinc-400 text-sm mt-0.5">
                            {orders.length} order{orders.length !== 1 ? "s" : ""} found
                        </p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-zinc-600 rounded-xl text-sm font-semibold hover:bg-stone-50 transition-all disabled:opacity-50"
                    >
                        <FaSync size={11} className={refreshing ? "animate-spin" : ""} />
                        {refreshing ? "Refreshing..." : "Refresh"}
                    </button>
                </div>

                {/* Error */}
                {status === "failed" && error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                        ⚠️ {error}
                    </div>
                )}

                {/* Empty */}
                {orders.length === 0 && status === "succeeded" && (
                    <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-16 text-center">
                        <FaShoppingBag size={36} className="text-stone-300 mx-auto mb-3" />
                        <p className="text-zinc-500 font-semibold mb-1">No orders yet</p>
                        <p className="text-zinc-400 text-sm mb-5">Start shopping and your orders will appear here</p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold text-sm hover:bg-zinc-800 transition-all active:scale-95"
                        >
                            Start Shopping <FaArrowRight size={11} />
                        </Link>
                    </div>
                )}

                {/* Orders List */}
                <div className="space-y-4">
                    {orders.map(order => {
                        const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED;
                        const productNames = [...new Set(order.items?.map(i => i.name))].join(", ");

                        return (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                {/* Top bar */}
                                <div className="flex items-center justify-between px-5 py-3 bg-stone-50 border-b border-stone-100">
                                    <div>
                                        <p className="text-xs font-mono font-bold text-zinc-600">
                                            #{order._id.slice(-8).toUpperCase()}
                                        </p>
                                        <p className="text-[11px] text-zinc-400 mt-0.5">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "short", year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${cfg.color}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Body */}
                                <div className="p-5 flex flex-col sm:flex-row items-center gap-4">

                                    {/* Product images */}
                                    <div className="flex -space-x-2 shrink-0">
                                        {order.items?.slice(0, 3).map((item, i) => {
                                            const img = getItemImage(item);
                                            return (
                                                <div
                                                    key={i}
                                                    className="w-14 h-14 rounded-xl border-2 border-white shadow-sm bg-stone-100 overflow-hidden flex items-center justify-center"
                                                >
                                                    {img ? (
                                                        <img
                                                            src={img}
                                                            alt={item.name}
                                                            className="w-full h-full object-contain p-1"
                                                            onError={e => { e.target.style.display = "none"; }}
                                                        />
                                                    ) : (
                                                        <FaBoxOpen size={18} className="text-stone-400" />
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {order.items?.length > 3 && (
                                            <div className="w-14 h-14 rounded-xl border-2 border-white shadow-sm bg-stone-200 flex items-center justify-center">
                                                <span className="text-xs font-bold text-zinc-500">+{order.items.length - 3}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 text-center sm:text-left min-w-0">
                                        <p className="font-bold text-zinc-800 text-sm truncate">{productNames || "Order Items"}</p>
                                        <p className="text-xs text-zinc-400 mt-0.5">{order.items?.length || 0} item{order.items?.length !== 1 ? "s" : ""}</p>
                                    </div>

                                    {/* Total + CTA */}
                                    <div className="text-center sm:text-right shrink-0">
                                        <p className="text-xl font-black text-emerald-600">
                                            ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                                        </p>
                                        <Link
                                            to={`/orders/${order._id}`}
                                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-white bg-zinc-900 px-4 py-2 rounded-xl hover:bg-amber-500 transition-all active:scale-95"
                                        >
                                            View Details <FaArrowRight size={9} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MyOrders;