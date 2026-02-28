import { useNavigate } from "react-router-dom";
import { CATEGORIES } from "../data/categories";

const ShopByCategory = () => {
    const navigate = useNavigate();

    return (
        <section className="py-6">
            <h2 className="text-xl font-black text-zinc-900 mb-4">Shop by Category</h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => navigate(`/?category=${encodeURIComponent(cat.value)}`)}
                        className="bg-white rounded-2xl border border-stone-200 hover:border-amber-400 hover:shadow-md transition-all duration-200 p-3 flex flex-col items-center gap-2 text-center group active:scale-95"
                    >
                        {/* ✅ Emoji — no image file needed */}
                        <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                            {cat.icon}
                        </span>
                        <span className="text-[11px] font-semibold text-zinc-600 group-hover:text-amber-600 leading-tight transition-colors">
                            {cat.name}
                        </span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default ShopByCategory;