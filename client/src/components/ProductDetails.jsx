import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../contexts/AuthContext";
import RelatedProductsSlider from "../components/RelatedProductsSlider";
import {
    FaStar,
    FaRegStar,
    FaShoppingCart,
    FaBolt,
    FaTrash,
    FaCheckCircle,
    FaTruck,
    FaShieldAlt,
    FaArrowLeft,
} from "react-icons/fa";

/* ── Star Row (display only) ── */
const StarRow = ({ value }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) =>
            s <= value ? (
                <FaStar key={s} className="text-amber-400" />
            ) : (
                <FaRegStar key={s} className="text-stone-300" />
            )
        )}
    </div>
);

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { user } = useAuth();
    const isAuthenticated = Boolean(user);

    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    /* Review form */
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSuccess, setReviewSuccess] = useState(false);

    const fetchReviews = async () => {
        try {
            const { data } = await api.get(`/reviews/${id}`);
            setReviews(data);
        } catch { }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [{ data: prod }, { data: related }] = await Promise.all([
                    api.get(`/products/${id}`),
                    api.get(`/products/${id}/related`),
                ]);
                setProduct(prod);
                setRelatedProducts(related);
                await fetchReviews();
            } catch {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    /* Pre-fill user's review */
    useEffect(() => {
        if (!user || reviews.length === 0) return;
        const mine = reviews.find(
            (r) => r.user === user._id || r.user?._id === user._id
        );
        if (mine) {
            setMyRating(mine.rating);
            setMyComment(mine.comment || "");
        }
    }, [reviews, user]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (myRating === 0) {
            setReviewError("Please select a rating");
            return;
        }
        try {
            setSubmitting(true);
            setReviewError("");
            await api.post(`/reviews/${id}`, {
                rating: myRating,
                comment: myComment,
            });
            setReviewSuccess(true);
            await fetchReviews();
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
            setTimeout(() => setReviewSuccess(false), 2500);
        } catch (err) {
            setReviewError(err.response?.data?.message || "Review failed");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId) => {
        try {
            await api.delete(`/reviews/${reviewId}`);
            await fetchReviews();
            setMyRating(0);
            setMyComment("");
        } catch { }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product || error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                {error || "Product not found"}
            </div>
        );
    }

    const imageUrl =
        product.images?.[0]?.url ||
        "https://via.placeholder.com/600x600?text=No+Image";

    return (
        <div className="min-h-screen bg-stone-100 py-6 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm text-zinc-500 mb-5"
                >
                    <FaArrowLeft /> Back
                </button>

                {/* Product */}
                <div className="bg-white rounded-2xl p-6 mb-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-96 object-contain mx-auto"
                        />

                        <div>
                            <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

                            <div className="flex items-center gap-2 mb-4">
                                <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded">
                                    {product.rating?.toFixed(1) || "0.0"} ★
                                </span>
                                <span className="text-sm text-zinc-400">
                                    {product.numReviews || 0} ratings
                                </span>
                            </div>

                            <p className="text-3xl font-black text-emerald-600 mb-4">
                                ₹{product.price}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => addItem(product)}
                                    className="flex-1 bg-black text-white py-3 rounded-xl font-bold"
                                >
                                    <FaShoppingCart /> Add to Cart
                                </button>
                                <button
                                    onClick={() =>
                                        navigate("/checkout", {
                                            state: { buyNowItem: { ...product, quantity: 1 } },
                                        })
                                    }
                                    className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold"
                                >
                                    <FaBolt /> Buy Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews */}
                <div className="bg-white rounded-2xl p-6">
                    <h2 className="font-bold mb-4">Ratings & Reviews</h2>

                    {/* Write review */}
                    {isAuthenticated ? (
                        <form onSubmit={handleSubmitReview} className="mb-6">
                            <div className="flex gap-1 mb-3">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setMyRating(s)}
                                        className="text-2xl"
                                    >
                                        {s <= myRating ? (
                                            <FaStar className="text-amber-400" />
                                        ) : (
                                            <FaRegStar className="text-stone-300" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={myComment}
                                onChange={(e) => setMyComment(e.target.value)}
                                rows={3}
                                placeholder="Write review (optional)"
                                className="w-full border rounded-lg p-3 mb-3"
                            />

                            {reviewError && (
                                <p className="text-red-500 text-sm mb-2">{reviewError}</p>
                            )}
                            {reviewSuccess && (
                                <p className="text-emerald-600 text-sm mb-2 flex items-center gap-1">
                                    <FaCheckCircle /> Review submitted
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-amber-500 text-white px-5 py-2 rounded-lg font-bold"
                            >
                                Submit Review
                            </button>
                        </form>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            className="bg-amber-500 text-white px-5 py-2 rounded-lg font-bold mb-6"
                        >
                            Login to Review
                        </button>
                    )}

                    {/* Review list */}
                    {reviews.length === 0 ? (
                        <p className="text-zinc-400 text-sm">No reviews yet</p>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map((r) => {
                                const isOwn =
                                    user && (r.user === user._id || r.user?._id === user._id);

                                return (
                                    <div key={r._id} className="border rounded-xl p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                {/* Avatar (initial letter) */}
                                                <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
                                                    {r.name?.[0]?.toUpperCase() || "U"}
                                                </div>

                                                <div>
                                                    <p className="font-semibold text-sm">{r.name}</p>
                                                    <StarRow value={r.rating} />
                                                </div>
                                            </div>

                                            {isOwn && (
                                                <button
                                                    onClick={() => handleDeleteReview(r._id)}
                                                    className="text-red-400"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>

                                        {r.comment && (
                                            <p className="text-sm text-zinc-600 mt-2">{r.comment}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Related */}
                {relatedProducts.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 mt-6">
                        <h2 className="font-bold mb-4">Similar Products</h2>
                        <RelatedProductsSlider products={relatedProducts} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;