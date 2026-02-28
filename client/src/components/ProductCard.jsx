import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { FaStar, FaRegStar } from "react-icons/fa";

const ProductCard = ({ product }) => {
    const navigate = useNavigate();
    const { cartItems, addItem } = useCart();
    const inCart = cartItems.some((item) => item._id === product._id);

    const imageUrl =
        product?.images?.[0]?.url ||
        product?.image ||
        "https://via.placeholder.com/400x400?text=No+Image";

    const handleBuyNow = (e) => {
        e.stopPropagation();
        navigate("/checkout", {
            state: { buyNowItem: { ...product, quantity: 1 } },
        });
    };

    const rating = product.rating || 0;
    const numReviews = product.numReviews || 0;
    const ratingLabel =
        rating >= 4.5 ? "Excellent" :
            rating >= 4 ? "Very Good" :
                rating >= 3 ? "Good" :
                    rating >= 2 ? "Fair" : "";

    return (
        <div
            onClick={() => navigate(`/products/${product._id}`)}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full border border-stone-100 hover:border-stone-200 group overflow-hidden"
        >
            {/* IMAGE */}
            <div className="relative overflow-hidden bg-stone-50 h-52 flex items-center justify-center">
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 p-3"
                    onError={(e) => { e.target.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
                />
                {product.isCustomizable && (
                    <span className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase shadow-sm">
                        Customizable
                    </span>
                )}
            </div>

            {/* INFO */}
            <div className="flex flex-col flex-1 p-4">
                <h3 className="text-sm font-bold mb-1 line-clamp-1 text-zinc-800 group-hover:text-amber-600 transition-colors">
                    {product.name}
                </h3>

                {/* ⭐ Rating Badge */}
                <div className="flex items-center gap-1.5 mb-2">
                    {numReviews > 0 ? (
                        <>
                            <span className={`flex items-center gap-0.5 text-white text-[11px] font-bold px-1.5 py-0.5 rounded ${rating >= 4 ? "bg-emerald-500" : rating >= 3 ? "bg-amber-400" : "bg-red-400"}`}>
                                {rating.toFixed(1)} <FaStar size={8} />
                            </span>
                            <span className="text-[11px] text-zinc-400">({numReviews})</span>
                            {ratingLabel && <span className="text-[11px] text-zinc-400">{ratingLabel}</span>}
                        </>
                    ) : (
                        <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                                <FaRegStar key={s} size={11} className="text-stone-300" />
                            ))}
                            <span className="text-[11px] text-zinc-400 ml-1">No ratings yet</span>
                        </div>
                    )}
                </div>

                <p className="text-zinc-400 text-xs mb-3 line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                <div className="mt-auto">
                    <p className="text-emerald-600 text-xl font-black mb-3">
                        ₹{product.price.toLocaleString("en-IN")}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); addItem(product); }}
                            disabled={inCart}
                            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${inCart
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                    : "bg-zinc-900 text-white hover:bg-zinc-800 active:scale-95"
                                }`}
                        >
                            {inCart ? "✔ In Cart" : "Add to Cart"}
                        </button>
                        <button
                            onClick={handleBuyNow}
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

export default ProductCard;