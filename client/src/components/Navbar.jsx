import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
    FaSearch,
    FaShoppingCart,
    FaTimes,
    FaBars,
    FaUser,
    FaBox,
    FaSignOutAlt,
    FaHome,
} from "react-icons/fa";
import { useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext";
import SearchBar from "./SearchBar";
import Logo from "../assets/logo.png.jpeg";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const isAuthenticated = Boolean(user);

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const userMenuRef = useRef(null);

    /* CART */
    const cartItems = useSelector((state) => state.cart?.items || []);
    const totalItems = cartItems.reduce(
        (sum, i) => sum + (i.quantity || 0),
        0
    );

    /* Scroll shadow */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Close user menu on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const go = (path) => {
        setMobileOpen(false);
        setUserMenuOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        setMobileOpen(false);
        navigate("/login", { replace: true });
    };

    const handleSearch = (query) => {
        setMobileOpen(false);
        navigate(`/?search=${encodeURIComponent(query)}`);
    };

    return (
        <nav
            className={`sticky top-0 z-50 bg-white border-b transition-all ${scrolled ? "shadow-md" : ""
                }`}
        >
            {/* TOP BAR */}
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
                {/* LOGO */}
                <button
                    onClick={() => go("/")}
                    className="flex items-center gap-2 hover:opacity-90 transition"
                >
                    <img
                        src={Logo}
                        alt="RV Gifts"
                        className="h-9 w-9 object-contain"
                    />
                    <span className="font-bold text-lg">
                        RV<span className="text-amber-600">Gifts</span>
                    </span>
                </button>

                {/* DESKTOP SEARCH */}
                <div className="hidden md:flex flex-1 max-w-xl">
                    <SearchBar onSearch={handleSearch} />
                </div>

                {/* DESKTOP ACTIONS */}
                <div className="hidden md:flex items-center gap-6 ml-auto">
                    {/* CART */}
                    <button
                        onClick={() => go("/cart")}
                        className="relative hover:text-amber-600 transition"
                    >
                        <FaShoppingCart size={18} />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {totalItems}
                            </span>
                        )}
                    </button>

                    {/* AUTH */}
                    {isAuthenticated ? (
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() =>
                                    setUserMenuOpen((prev) => !prev)
                                }
                                className="flex items-center gap-2 font-medium px-3 py-1.5 rounded-lg hover:bg-stone-100 transition"
                            >
                                <FaUser />
                                <span className="max-w-[120px] truncate">
                                    {user?.name}
                                </span>
                            </button>

                            {userMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden">
                                    <button
                                        onClick={() => go("/orders")}
                                        className="w-full px-4 py-3 flex items-center gap-2 text-sm hover:bg-stone-100 transition"
                                    >
                                        <FaBox /> My Orders
                                    </button>

                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-3 flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 transition"
                                    >
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-4 text-sm font-medium">
                            <NavLink
                                to="/login"
                                className="hover:text-amber-600 transition"
                            >
                                Login
                            </NavLink>
                            <NavLink
                                to="/register"
                                className="hover:text-amber-600 transition"
                            >
                                Register
                            </NavLink>
                        </div>
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                <button
                    className="md:hidden ml-auto hover:text-amber-600 transition"
                    onClick={() => setMobileOpen((s) => !s)}
                >
                    {mobileOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
                </button>
            </div>

            {/* MOBILE MENU */}
            {mobileOpen && (
                <div className="md:hidden border-t bg-white px-4 py-4 space-y-4">
                    <SearchBar onSearch={handleSearch} />

                    <button
                        onClick={() => go("/")}
                        className="flex items-center gap-3 w-full hover:text-amber-600 transition"
                    >
                        <FaHome /> Home
                    </button>

                    <button
                        onClick={() => go("/cart")}
                        className="flex items-center gap-3 w-full hover:text-amber-600 transition"
                    >
                        <FaShoppingCart /> Cart
                        {totalItems > 0 && (
                            <span className="text-xs">({totalItems})</span>
                        )}
                    </button>

                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={() => go("/orders")}
                                className="flex items-center gap-3 w-full hover:text-amber-600 transition"
                            >
                                <FaBox /> My Orders
                            </button>

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full text-red-600 hover:bg-red-50 px-2 py-2 rounded-lg transition"
                            >
                                <FaSignOutAlt /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={() => go("/login")}
                                className="flex items-center gap-3 w-full hover:text-amber-600 transition"
                            >
                                <FaUser /> Login
                            </button>
                            <button
                                onClick={() => go("/register")}
                                className="flex items-center gap-3 w-full hover:text-amber-600 transition"
                            >
                                <FaUser /> Register
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;