import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/adminApi";
import {
    FaPlus, FaSync, FaEdit, FaTrash, FaSearch,
    FaBoxOpen, FaTag, FaCheckCircle, FaTimesCircle,
    FaSortAmountDown, FaFilter
} from "react-icons/fa";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [confirmId, setConfirmId] = useState(null);

    // ── Fetch ──
    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data } = await api.get("/products");
            const list = Array.isArray(data) ? data : [];
            setProducts(list);
            setFiltered(list);
        } catch (err) {
            console.error("FETCH PRODUCTS ERROR:", err);
            setError("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    // ── Search filter ──
    useEffect(() => {
        if (!search.trim()) return setFiltered(products);
        const q = search.toLowerCase();
        setFiltered(products.filter(p =>
            p.name?.toLowerCase().includes(q) ||
            p.category?.toLowerCase().includes(q)
        ));
    }, [search, products]);

    // ── Delete ──
    const deleteHandler = async (id) => {
        try {
            setDeletingId(id);
            await api.delete(`/products/${id}`);
            setProducts(prev => prev.filter(p => p._id !== id));
            setFiltered(prev => prev.filter(p => p._id !== id));
        } catch (err) {
            console.error("DELETE ERROR:", err);
            alert("Failed to delete product");
        } finally {
            setDeletingId(null);
            setConfirmId(null);
        }
    };

    const refreshProducts = async () => {
        setRefreshing(true);
        await fetchProducts();
        setTimeout(() => setRefreshing(false), 600);
    };

    const formatCat = (cat) => cat?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—";

    // ── Loading ──
    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-500 font-medium text-sm">Loading products...</p>
            </div>
        </div>
    );

    // ── Error ──
    if (error) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="text-center bg-white rounded-2xl p-10 border border-stone-200 shadow-sm">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="text-zinc-700 font-bold mb-4">{error}</p>
                <button onClick={fetchProducts} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors">
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); .admin-root { font-family: 'DM Sans', sans-serif; }`}</style>

            <div className="admin-root max-w-7xl mx-auto px-4 py-8">

                {/* ── Header ── */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900">Product Management</h1>
                        <p className="text-zinc-400 text-sm mt-0.5">
                            {products.length} total · {filtered.length} showing
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={refreshProducts}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-zinc-600 rounded-xl text-sm font-semibold hover:bg-stone-50 hover:border-stone-300 transition-all disabled:opacity-50"
                        >
                            <FaSync size={12} className={refreshing ? "animate-spin" : ""} />
                            {refreshing ? "Refreshing..." : "Refresh"}
                        </button>
                        <Link
                            to="/admin/products/new"
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 active:scale-95 transition-all shadow-md shadow-amber-200"
                        >
                            <FaPlus size={12} /> Add Product
                        </Link>
                    </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Total Products", value: products.length, color: "text-zinc-800", bg: "bg-white" },
                        { label: "Customizable", value: products.filter(p => p.isCustomizable).length, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                        { label: "Categories", value: [...new Set(products.map(p => p.category))].filter(Boolean).length, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                        { label: "Avg Price", value: `₹${products.length ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length).toLocaleString("en-IN") : 0}`, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
                    ].map(({ label, value, color, bg }) => (
                        <div key={label} className={`${bg} border border-stone-200 rounded-2xl px-4 py-3`}>
                            <p className="text-xs text-zinc-400 font-medium mb-0.5">{label}</p>
                            <p className={`text-xl font-black ${color}`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* ── Search Bar ── */}
                <div className="relative mb-4">
                    <FaSearch size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name or category..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-zinc-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                            ✕
                        </button>
                    )}
                </div>

                {/* ── Empty State ── */}
                {filtered.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-16 text-center">
                        <FaBoxOpen size={40} className="text-stone-300 mx-auto mb-4" />
                        <p className="text-zinc-500 font-semibold mb-1">
                            {search ? `No results for "${search}"` : "No products yet"}
                        </p>
                        <p className="text-zinc-400 text-sm mb-4">
                            {search ? "Try a different search term" : "Add your first product to get started"}
                        </p>
                        {!search && (
                            <Link to="/admin/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 transition-all">
                                <FaPlus size={11} /> Add First Product
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-3 px-5 py-3 bg-stone-50 border-b border-stone-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                            <div className="col-span-1">#</div>
                            <div className="col-span-1">Image</div>
                            <div className="col-span-4">Product</div>
                            <div className="col-span-2 hidden md:block">Category</div>
                            <div className="col-span-2">Price</div>
                            <div className="col-span-1 hidden md:block">Custom</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>

                        {/* Table Rows */}
                        <div className="divide-y divide-stone-100">
                            {filtered.map((product, idx) => {
                                const imageUrl = product.images?.[0]?.url || product.image || null;
                                const isDeleting = deletingId === product._id;
                                const isConfirming = confirmId === product._id;

                                return (
                                    <div
                                        key={product._id}
                                        className={`grid grid-cols-12 gap-3 px-5 py-4 items-center hover:bg-stone-50 transition-colors duration-150 ${isDeleting ? "opacity-50" : ""}`}
                                    >
                                        {/* Index */}
                                        <div className="col-span-1 text-xs text-zinc-400 font-medium">{idx + 1}</div>

                                        {/* Image */}
                                        <div className="col-span-1">
                                            <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {imageUrl ? (
                                                    <img src={imageUrl} alt={product.name} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <FaBoxOpen size={14} className="text-stone-400" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div className="col-span-4">
                                            <p className="font-semibold text-zinc-800 text-sm line-clamp-1">{product.name}</p>
                                            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{product.description || "No description"}</p>
                                        </div>

                                        {/* Category */}
                                        <div className="col-span-2 hidden md:block">
                                            <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                                {formatCat(product.category)}
                                            </span>
                                        </div>

                                        {/* Price */}
                                        <div className="col-span-2">
                                            <p className="font-black text-emerald-600 text-sm">
                                                ₹{Number(product.price || 0).toLocaleString("en-IN")}
                                            </p>
                                        </div>

                                        {/* Customizable */}
                                        <div className="col-span-1 hidden md:block">
                                            {product.isCustomizable
                                                ? <FaCheckCircle className="text-emerald-500" size={15} />
                                                : <FaTimesCircle className="text-stone-300" size={15} />
                                            }
                                        </div>

                                        {/* Actions */}
                                        <div className="col-span-1 flex items-center justify-end gap-1.5">
                                            <Link
                                                to={`/admin/products/${product._id}/edit`}
                                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 border border-blue-200 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-150"
                                                title="Edit"
                                            >
                                                <FaEdit size={12} />
                                            </Link>

                                            {isConfirming ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => deleteHandler(product._id)}
                                                        disabled={isDeleting}
                                                        className="px-2 py-1 bg-red-500 text-white rounded-lg text-[11px] font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                                    >
                                                        {isDeleting ? "..." : "Yes"}
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(null)}
                                                        className="px-2 py-1 bg-stone-100 text-zinc-600 rounded-lg text-[11px] font-bold hover:bg-stone-200 transition-colors"
                                                    >
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmId(product._id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 border border-red-200 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-150"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className="px-5 py-3 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                            <p className="text-xs text-zinc-400">
                                Showing <span className="font-semibold text-zinc-600">{filtered.length}</span> of <span className="font-semibold text-zinc-600">{products.length}</span> products
                            </p>
                            <Link
                                to="/admin/products/new"
                                className="flex items-center gap-1.5 text-xs text-amber-600 font-bold hover:text-amber-700 transition-colors"
                            >
                                <FaPlus size={10} /> Add New
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminProducts;