import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../hooks/useCart";
import { FaStar, FaRegStar, FaSearch, FaFire, FaGift } from "react-icons/fa";

// ── Skeleton Card ──
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden animate-pulse">
        <div className="h-52 bg-stone-200" />
        <div className="p-4 space-y-3">
            <div className="h-4 bg-stone-200 rounded w-3/4" />
            <div className="h-3 bg-stone-100 rounded w-1/2" />
            <div className="h-3 bg-stone-100 rounded w-full" />
            <div className="h-3 bg-stone-100 rounded w-2/3" />
            <div className="h-6 bg-stone-200 rounded w-1/3 mt-2" />
            <div className="flex gap-2 mt-2">
                <div className="h-9 bg-stone-100 rounded-xl flex-1" />
                <div className="h-9 bg-emerald-100 rounded-xl flex-1" />
            </div>
        </div>
    </div>
);

// ── Product Card ──
const ProductCard = ({ product, onAddToCart, onBuyNow }) => {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const inCart = cartItems.some(i => i._id === product._id);

    const imageUrl = product.images?.[0]?.url || product.image ||
        "https://via.placeholder.com/400x400?text=No+Image";
    const rating = product.rating || 0;
    const numReviews = product.numReviews || 0;

    return (
        <div
            onClick={() => navigate(`/products/${product._id}`)}
            className="group bg-white rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-xl shadow-sm transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-52 bg-stone-50 flex items-center justify-center overflow-hidden">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    onError={e => { e.target.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
                />
                {product.isCustomizable && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Customizable
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-zinc-800 text-sm line-clamp-1 mb-1 group-hover:text-amber-600 transition-colors">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mb-2">
                    {numReviews > 0 ? (
                        <>
                            <span className={`flex items-center gap-0.5 text-white text-[11px] font-bold px-1.5 py-0.5 rounded ${rating >= 4 ? "bg-emerald-500" : rating >= 3 ? "bg-amber-400" : "bg-red-400"}`}>
                                {rating.toFixed(1)} <FaStar size={8} />
                            </span>
                            <span className="text-[11px] text-zinc-400">({numReviews})</span>
                        </>
                    ) : (
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => <FaRegStar key={s} size={10} className="text-stone-300" />)}
                        </div>
                    )}
                </div>

                <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed mb-3">
                    {product.description}
                </p>

                <div className="mt-auto">
                    <p className="text-emerald-600 text-xl font-black mb-3">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={e => { e.stopPropagation(); onAddToCart(product); }}
                            disabled={inCart}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${inCart
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                                }`}
                        >
                            {inCart ? "✔ In Cart" : "Add to Cart"}
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); onBuyNow(product); }}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95 shadow-sm shadow-emerald-100 transition-all"
                        >
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main Home ──
const Home = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get("search") || "";
    const activeCategory = searchParams.get("category") || "";

    const { addItem } = useCart();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Derive unique categories from products
    const [allProducts, setAllProducts] = useState([]);
    const categories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];

    // Fetch all products once for category list
    useEffect(() => {
        api.get("/products").then(({ data }) => setAllProducts(data)).catch(() => { });
    }, []);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError("");
                const params = {};
                if (searchQuery) params.search = searchQuery;
                if (activeCategory) params.category = activeCategory;
                const { data } = await api.get("/products", { params });
                setProducts(data);
            } catch (err) {
                console.error("Fetch Error:", err);
                setError("Failed to load products. Please check your connection.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [searchQuery, activeCategory]);

    const handleAddToCart = useCallback((product) => {
        addItem(product);
    }, [addItem]);

    const handleBuyNow = useCallback((product) => {
        navigate("/checkout", { state: { buyNowItem: { ...product, quantity: 1 } } });
    }, [navigate]);

    const setCategory = (cat) => {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (cat) params.category = cat;
        setSearchParams(params);
    };

    const clearFilters = () => setSearchParams({});

    // Format category label
    const formatCat = (cat) => cat.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase());

    return (
        <div className="min-h-screen bg-stone-100">

            {/* ── Hero Banner ── */}
            {!searchQuery && !activeCategory && (
                <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white py-10 px-4">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FaGift className="text-amber-400" />
                                <span className="text-amber-400 text-sm font-semibold tracking-wide uppercase">Premium Gift Store</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
                                Gifts That <span className="text-amber-400">Speak</span> From<br />The Heart
                            </h1>
                            <p className="text-zinc-400 text-sm">Handpicked gifts for every occasion & loved ones</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
                                <p className="font-black text-amber-400 text-2xl">{allProducts.length}+</p>
                                <p className="text-zinc-400 text-xs">Products</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
                                <p className="font-black text-amber-400 text-2xl">{categories.length}+</p>
                                <p className="text-zinc-400 text-xs">Categories</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl px-5 py-3 text-center">
                                <p className="font-black text-amber-400 text-2xl">FREE</p>
                                <p className="text-zinc-400 text-xs">Delivery ₹499+</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 py-8">

                {/* ── Category Filter Pills ── */}
                {categories.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
                        <button
                            onClick={() => setCategory("")}
                            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${!activeCategory
                                    ? "bg-zinc-900 text-white border-zinc-900"
                                    : "bg-white text-zinc-600 border-stone-200 hover:border-zinc-400"
                                }`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-200 whitespace-nowrap ${activeCategory === cat
                                        ? "bg-amber-500 text-white border-amber-500"
                                        : "bg-white text-zinc-600 border-stone-200 hover:border-amber-400 hover:text-amber-600"
                                    }`}
                            >
                                {formatCat(cat)}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Page Title ── */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 flex items-center gap-2">
                            {searchQuery ? (
                                <><FaSearch size={16} className="text-amber-500" /> Results for "{searchQuery}"</>
                            ) : activeCategory ? (
                                <><FaFire size={16} className="text-amber-500" /> {formatCat(activeCategory)}</>
                            ) : (
                                <><FaFire size={16} className="text-amber-500" /> All Products</>
                            )}
                        </h2>
                        {!loading && (
                            <p className="text-zinc-400 text-xs mt-0.5">{products.length} product{products.length !== 1 ? "s" : ""} found</p>
                        )}
                    </div>
                    {(searchQuery || activeCategory) && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-amber-600 font-bold hover:text-amber-700 border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-lg transition-colors"
                        >
                            Clear Filters ✕
                        </button>
                    )}
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center mb-6">
                        <p className="text-red-500 font-bold mb-3">⚠️ {error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-zinc-900 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Skeleton Loading ── */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* ── Empty State ── */}
                {!loading && !error && products.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-stone-300">
                        <p className="text-4xl mb-3">🎁</p>
                        <p className="text-zinc-500 font-semibold mb-1">No products found</p>
                        <p className="text-zinc-400 text-sm mb-4">Try a different search or category</p>
                        <button
                            onClick={clearFilters}
                            className="text-amber-600 font-bold hover:text-amber-700 border border-amber-200 bg-amber-50 px-4 py-2 rounded-xl text-sm transition-colors"
                        >
                            Browse All Products
                        </button>
                    </div>
                )}

                {/* ── Product Grid ── */}
                {!loading && !error && products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {products.map(product => (
                            <ProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;