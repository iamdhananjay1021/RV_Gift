import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/adminApi";
import {
    FaArrowLeft, FaUpload, FaTimes, FaPlus,
    FaTag, FaRupeeSign, FaList, FaCheckCircle
} from "react-icons/fa";

// const CATEGORIES = [
//     { value: "wallet", name: "Wallet" },
//     { value: "women-tshirt", name: "Women T-Shirt" },
//     { value: "men-tshirt", name: "Men T-Shirt" },
//     { value: "printed-tshirt", name: "Printed T-Shirt" },
//     { value: "custom-tshirt", name: "Customized T-Shirt" },
//     { value: "photo-frame", name: "Photo Frame" },
//     { value: "printed-mug", name: "Printed Mug" },
//     { value: "keychain", name: "Key Chain" },
//     { value: "printed-cushion", name: "Printed Cushion" },
//     { value: "gift-hamper", name: "Gift Hamper" },
//     { value: "birthday-gift", name: "Birthday Gift" },
//     { value: "anniversary-gift", name: "Anniversary Gift" },
//     { value: "wedding-gift", name: "Wedding Gift" },
//     { value: "couple-gift", name: "Couple Gift" },
//     { value: "return-gift", name: "Return Gift" },
//     { value: "corporate-gift", name: "Corporate Gift" },
//     { value: "men-watch", name: "Men Watch" },
//     { value: "women-watch", name: "Women Watch" },
//     { value: "couple-watch", name: "Couple Watch" },
//     { value: "soft-toy", name: "Soft Toy" },
//     { value: "kids-toy", name: "Kids Toy" },
//     { value: "ladies-purse", name: "Ladies Purse" },
//     { value: "other", name: "Other" },
// ];
import { CATEGORIES } from "../data/categories";



const inputClass = "w-full px-4 py-3 border border-stone-200 rounded-xl text-sm text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-stone-50 focus:bg-white";

const AdminEditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "", description: "", price: "",
        category: "", isCustomizable: false, tags: "",
    });

    const [images, setImages] = useState([]);
    const [currentImages, setCurrentImages] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    /* ── Load Product ── */
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const { data } = await api.get(`/products/${id}`);
                setForm({
                    name: data.name || "",
                    description: data.description || "",
                    price: data.price?.toString() || "",
                    category: data.category || "",
                    isCustomizable: Boolean(data.isCustomizable),
                    tags: data.tags?.join(", ") || "",
                });
                setCurrentImages(data.images || []);
            } catch {
                setError("Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        setError("");
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        if (files.length > 5) return setError("Maximum 5 images allowed");
        for (const file of files) {
            if (file.size / (1024 * 1024) > 5)
                return setError(`${file.name} exceeds 5MB limit`);
        }
        setImages(files);
        setPreviewImages(files.map(f => URL.createObjectURL(f)));
        setError("");
    };

    const removeNewImage = (idx) => {
        setImages(prev => prev.filter((_, i) => i !== idx));
        setPreviewImages(prev => prev.filter((_, i) => i !== idx));
    };

    /* ── Submit ── */
    const submitHandler = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError("Product name is required");
        if (!form.price || Number(form.price) <= 0) return setError("Enter a valid price");
        if (!form.category) return setError("Please select a category");

        try {
            setSaving(true);
            setError("");

            const formData = new FormData();
            formData.append("name", form.name.trim());
            formData.append("description", form.description.trim());
            formData.append("price", Number(form.price));
            formData.append("category", form.category);
            formData.append("isCustomizable", form.isCustomizable ? "true" : "false");
            if (form.tags.trim()) formData.append("tags", form.tags.trim());
            images.forEach(img => formData.append("images", img));

            await api.put(`/products/${id}`, formData);
            setSuccess(true);
            setTimeout(() => navigate("/admin/products"), 1200);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    /* ── Loading ── */
    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            <div className="max-w-3xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate("/admin/products")}
                        className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-zinc-500 hover:text-zinc-800 hover:border-stone-300 transition-all"
                    >
                        <FaArrowLeft size={13} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-zinc-900">Edit Product</h1>
                        <p className="text-zinc-400 text-sm">Update product details below</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="h-1 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

                    <form onSubmit={submitHandler} className="p-6 space-y-5">

                        {/* Name */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">Product Name *</label>
                            <input name="name" value={form.name} onChange={handleChange}
                                placeholder="e.g. Premium Leather Wallet" className={inputClass} />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">Description</label>
                            <textarea name="description" value={form.description} onChange={handleChange}
                                placeholder="Describe your product..." rows={3}
                                className={`${inputClass} resize-none`} />
                        </div>

                        {/* Price + Category */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">Price (₹) *</label>
                                <div className="relative">
                                    <FaRupeeSign size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input type="number" name="price" value={form.price} onChange={handleChange}
                                        placeholder="0" min="1" className={`${inputClass} pl-9`} />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">Category *</label>
                                <div className="relative">
                                    <FaList size={11} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <select name="category" value={form.category} onChange={handleChange}
                                        className={`${inputClass} pl-9 appearance-none cursor-pointer`}>
                                        <option value="">Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                                Tags <span className="text-zinc-400 font-normal normal-case">(comma separated)</span>
                            </label>
                            <div className="relative">
                                <FaTag size={11} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input name="tags" value={form.tags} onChange={handleChange}
                                    placeholder="e.g. gift, birthday, men" className={`${inputClass} pl-9`} />
                            </div>
                        </div>

                        {/* Current Images */}
                        {currentImages.length > 0 && previewImages.length === 0 && (
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                                    Current Images
                                </label>
                                <div className="grid grid-cols-4 gap-3">
                                    {currentImages.map((img, i) => (
                                        <div key={i} className="relative">
                                            <img src={img.url} alt={`product ${i + 1}`}
                                                className="w-full h-20 object-cover rounded-xl border border-stone-200" />
                                            {i === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Main</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-zinc-400 mt-2">Upload new images below to replace current ones</p>
                            </div>
                        )}

                        {/* Upload New Images */}
                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                                {previewImages.length > 0 ? "New Images (will replace current)" : "Replace Images"} <span className="text-zinc-400 font-normal normal-case">(optional, max 5)</span>
                            </label>
                            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-stone-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 group">
                                <FaUpload size={18} className="text-stone-400 group-hover:text-amber-500 mb-2 transition-colors" />
                                <p className="text-sm text-zinc-500 group-hover:text-amber-600 font-medium">Click to upload new images</p>
                                <p className="text-xs text-zinc-400 mt-0.5">PNG, JPG, WEBP · Max 5MB each</p>
                                <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                            </label>

                            {previewImages.length > 0 && (
                                <div className="grid grid-cols-4 gap-3 mt-3">
                                    {previewImages.map((img, i) => (
                                        <div key={i} className="relative group">
                                            <img src={img} alt={`preview ${i + 1}`}
                                                className="w-full h-20 object-cover rounded-xl border border-stone-200" />
                                            <button type="button" onClick={() => removeNewImage(i)}
                                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <FaTimes size={8} />
                                            </button>
                                            {i === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">Main</span>
                                            )}
                                        </div>
                                    ))}
                                    {previewImages.length < 5 && (
                                        <label className="w-full h-20 border-2 border-dashed border-stone-200 rounded-xl flex items-center justify-center cursor-pointer hover:border-amber-400 transition-colors">
                                            <FaPlus size={16} className="text-stone-400" />
                                            <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Customizable Toggle */}
                        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                            <div>
                                <p className="font-semibold text-zinc-700 text-sm">Customizable Product</p>
                                <p className="text-xs text-zinc-400 mt-0.5">Customers can request custom designs</p>
                            </div>
                            <button type="button"
                                onClick={() => setForm(prev => ({ ...prev, isCustomizable: !prev.isCustomizable }))}
                                className={`relative w-11 h-6 rounded-full transition-all duration-300 ${form.isCustomizable ? "bg-amber-500" : "bg-stone-300"}`}>
                                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${form.isCustomizable ? "left-5" : "left-0.5"}`} />
                            </button>
                        </div>

                        {/* Error / Success */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                                ⚠️ {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                                <FaCheckCircle /> Product updated! Redirecting...
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => navigate("/admin/products")}
                                className="flex-1 py-3 rounded-xl border border-stone-200 text-zinc-600 font-semibold text-sm hover:bg-stone-50 transition-all">
                                Cancel
                            </button>
                            <button type="submit" disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm transition-all active:scale-95 disabled:opacity-60 shadow-md shadow-amber-200 flex items-center justify-center gap-2">
                                {saving ? (
                                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
                                ) : "Update Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminEditProduct;