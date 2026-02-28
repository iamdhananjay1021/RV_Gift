import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/adminApi";
import {
    FaBox, FaClipboardList, FaPlus, FaRupeeSign,
    FaShoppingBag, FaTruck, FaCheckCircle, FaClock,
    FaArrowRight, FaFire
} from "react-icons/fa";

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: orders } = await api.get("/orders");
                const { data: products } = await api.get("/products");

                const list = Array.isArray(orders) ? orders : [];
                const prodList = Array.isArray(products) ? products : [];

                const delivered = list.filter(o => o.orderStatus === "DELIVERED");
                const pending = list.filter(o => o.orderStatus === "PLACED");
                const revenue = delivered.reduce((s, o) => s + (o.totalAmount || 0), 0);

                setStats({
                    totalOrders: list.length,
                    totalProducts: prodList.length,
                    revenue,
                    pending: pending.length,
                    delivered: delivered.length,
                    inTransit: list.filter(o => ["SHIPPED", "OUT_FOR_DELIVERY"].includes(o.orderStatus)).length,
                });

                setRecentOrders(list.slice(0, 5));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const STATUS_CONFIG = {
        PLACED: { label: "Placed", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-400" },
        CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-700", dot: "bg-blue-400" },
        PACKED: { label: "Packed", color: "bg-purple-100 text-purple-700", dot: "bg-purple-400" },
        SHIPPED: { label: "Shipped", color: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-400" },
        OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "bg-orange-100 text-orange-700", dot: "bg-orange-400" },
        DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
    };

    return (
        <div className="min-h-screen bg-stone-50">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); .dash{font-family:'DM Sans',sans-serif;}`}</style>

            <div className="dash max-w-6xl mx-auto px-4 py-8 space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900">Dashboard</h1>
                        <p className="text-zinc-400 text-sm mt-0.5">
                            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                        </p>
                    </div>
                    <Link
                        to="/admin/products/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 active:scale-95 transition-all shadow-md shadow-amber-200"
                    >
                        <FaPlus size={11} /> Add Product
                    </Link>
                </div>

                {/* ── Stats Grid ── */}
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-stone-200 h-24 animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            {
                                label: "Total Revenue",
                                value: `₹${(stats?.revenue || 0).toLocaleString("en-IN")}`,
                                icon: <FaRupeeSign size={14} />,
                                color: "text-emerald-600",
                                bg: "bg-emerald-50 border-emerald-100",
                                iconBg: "bg-emerald-500",
                            },
                            {
                                label: "Total Orders",
                                value: stats?.totalOrders || 0,
                                icon: <FaShoppingBag size={14} />,
                                color: "text-blue-600",
                                bg: "bg-blue-50 border-blue-100",
                                iconBg: "bg-blue-500",
                            },
                            {
                                label: "Products",
                                value: stats?.totalProducts || 0,
                                icon: <FaBox size={14} />,
                                color: "text-amber-600",
                                bg: "bg-amber-50 border-amber-100",
                                iconBg: "bg-amber-500",
                            },
                            {
                                label: "Pending",
                                value: stats?.pending || 0,
                                icon: <FaClock size={14} />,
                                color: "text-red-500",
                                bg: "bg-red-50 border-red-100",
                                iconBg: "bg-red-500",
                            },
                        ].map(({ label, value, icon, color, bg, iconBg }) => (
                            <div key={label} className={`bg-white border ${bg} rounded-2xl p-4`}>
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-zinc-400 font-medium">{label}</p>
                                    <div className={`w-7 h-7 ${iconBg} rounded-lg flex items-center justify-center text-white`}>
                                        {icon}
                                    </div>
                                </div>
                                <p className={`text-2xl font-black ${color}`}>{value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Order Status Row ── */}
                {!loading && stats && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Delivered", value: stats.delivered, icon: <FaCheckCircle size={13} />, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                            { label: "In Transit", value: stats.inTransit, icon: <FaTruck size={13} />, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                            { label: "New Orders", value: stats.pending, icon: <FaFire size={13} />, color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
                        ].map(({ label, value, icon, color, bg }) => (
                            <div key={label} className={`bg-white border ${bg} rounded-2xl px-4 py-3 flex items-center justify-between`}>
                                <div>
                                    <p className="text-xs text-zinc-400 font-medium">{label}</p>
                                    <p className={`text-xl font-black ${color} mt-0.5`}>{value}</p>
                                </div>
                                <div className={`${color} opacity-60`}>{icon}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Quick Actions ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        {
                            to: "/admin/products",
                            icon: <FaBox size={20} className="text-amber-500" />,
                            label: "Manage Products",
                            desc: "Add, edit, delete products",
                            bg: "bg-amber-50 border-amber-200",
                            linkColor: "text-amber-600 hover:text-amber-700",
                        },
                        {
                            to: "/admin/orders",
                            icon: <FaClipboardList size={20} className="text-blue-500" />,
                            label: "Manage Orders",
                            desc: "Update order status, view details",
                            bg: "bg-blue-50 border-blue-200",
                            linkColor: "text-blue-600 hover:text-blue-700",
                        },
                        {
                            to: "/admin/products/new",
                            icon: <FaPlus size={20} className="text-emerald-500" />,
                            label: "Add New Product",
                            desc: "Upload images, set price & category",
                            bg: "bg-emerald-50 border-emerald-200",
                            linkColor: "text-emerald-600 hover:text-emerald-700",
                        },
                    ].map(({ to, icon, label, desc, bg, linkColor }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`group bg-white border ${bg} rounded-2xl p-5 hover:shadow-md transition-all duration-200 flex flex-col gap-3`}
                        >
                            <div className="w-10 h-10 bg-white rounded-xl border border-stone-200 flex items-center justify-center shadow-sm">
                                {icon}
                            </div>
                            <div>
                                <p className="font-bold text-zinc-800 text-sm">{label}</p>
                                <p className="text-xs text-zinc-400 mt-0.5">{desc}</p>
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${linkColor} mt-auto`}>
                                Go <FaArrowRight size={9} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>

                {/* ── Recent Orders ── */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                        <h2 className="font-black text-zinc-800 text-sm">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-xs text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1">
                            View all <FaArrowRight size={9} />
                        </Link>
                    </div>

                    {loading ? (
                        <div className="p-5 space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-12 bg-stone-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="py-12 text-center">
                            <FaShoppingBag size={28} className="text-stone-300 mx-auto mb-2" />
                            <p className="text-zinc-400 text-sm">No orders yet</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100">
                            {recentOrders.map(order => {
                                const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.PLACED;
                                return (
                                    <div key={order._id} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                                                <FaShoppingBag size={12} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-800 text-sm">
                                                    #{order._id.slice(-6).toUpperCase()}
                                                </p>
                                                <p className="text-xs text-zinc-400">{order.customerName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                {cfg.label}
                                            </span>
                                            <p className="font-black text-emerald-600 text-sm">
                                                ₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;