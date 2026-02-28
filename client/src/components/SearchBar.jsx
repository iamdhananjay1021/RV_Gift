import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { FaSearch, FaTimes } from "react-icons/fa";

const SearchBar = ({ onSearch }) => {
    const [input, setInput] = useState("");
    const [error, setError] = useState("");
    const [searchParams] = useSearchParams();
    const location = useLocation();

    // URL → INPUT sync
    useEffect(() => {
        const q = searchParams.get("search") || "";
        setInput(q);
        setError("");
    }, [location.search]);

    const triggerSearch = () => {
        if (input.trim().length < 3) {
            setError("Enter at least 3 characters");
            return;
        }
        setError("");
        onSearch(input.trim());
    };

    const clearSearch = () => {
        setInput("");
        setError("");
        onSearch("");
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            triggerSearch();
        }
    };

    return (
        <div className="w-full">
            <div className="flex w-full rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-transparent transition-all duration-200">
                {/* Search icon */}
                <div className="flex items-center pl-4 text-zinc-400">
                    <FaSearch size={13} />
                </div>

                <input
                    type="text"
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setError(""); }}
                    onKeyDown={handleKeyDown}
                    placeholder="Search gifts, watches, toys..."
                    className="flex-1 px-3 py-2.5 text-sm text-zinc-800 placeholder-zinc-400 bg-transparent focus:outline-none"
                />

                {/* Clear button */}
                {input && (
                    <button
                        onClick={clearSearch}
                        className="px-2 text-zinc-400 hover:text-zinc-600 transition-colors"
                        aria-label="Clear search"
                    >
                        <FaTimes size={12} />
                    </button>
                )}

                {/* Search button */}
                <button
                    onClick={triggerSearch}
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white px-5 text-sm font-bold transition-all duration-200"
                >
                    Search
                </button>
            </div>

            {error && (
                <p className="text-red-500 text-xs mt-1.5 pl-1">{error}</p>
            )}
        </div>
    );
};

export default SearchBar;