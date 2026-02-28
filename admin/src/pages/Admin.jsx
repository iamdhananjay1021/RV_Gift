import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/AdminAuthContext";
import {
    FaThLarge, FaBox, FaClipboardList,
    FaSignOutAlt, FaGift, FaUserShield
} from "react-icons/fa";

const Admin = () => {
    const { admin, logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    const navItems = [
        { to: ".", end: true, icon: <FaThLarge size={14} />, label: "Dashboard" },
        { to: "products", icon: <FaBox size={14} />, label: "Products" },
        { to: "orders", icon: <FaClipboardList size={14} />, label: "Orders" },
    ];

    const roleColor = {
        owner: "bg-amber-100 text-amber-700 border-amber-200",
        admin: "bg-blue-100 text-blue-700 border-blue-200",
    };

    return (
        <div className="min-h-screen bg-stone-100 flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            {/* ── Top Bar ── */}
            <header className="bg-white border-b border-stone-200 px-6 py-3.5 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Brand */}
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-200">
                            <FaGift size={14} className="text-white" />
                        </div>
                        <div className="leading-none">
                            <p className="font-black text-zinc-900 text-base">RVGifts</p>
                            <p className="text-[10px] text-zinc-400 font-medium tracking-wide">Admin Panel</p>
                        </div>
                    </div>

                    {/* Right — profile + logout */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 py-2">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                                <span className="text-white text-xs font-black">
                                    {admin?.name?.[0]?.toUpperCase() || "A"}
                                </span>
                            </div>
                            <div className="leading-none">
                                <p className="text-xs font-bold text-zinc-700">{admin?.name || "Admin"}</p>
                                <p className="text-[10px] text-zinc-400 capitalize">{admin?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-500 rounded-xl text-xs font-bold hover:bg-red-500 hover:text-white transition-all duration-200"
                        >
                            <FaSignOutAlt size={11} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Body ── */}
            <div className="flex flex-1 max-w-7xl mx-auto w-full px-4 py-6 gap-5">

                {/* ── Sidebar ── */}
                <aside className="hidden lg:flex flex-col w-52 shrink-0 gap-4">

                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-200 mb-3">
                                <span className="text-white text-2xl font-black">
                                    {admin?.name?.[0]?.toUpperCase() || "A"}
                                </span>
                            </div>
                            <p className="font-black text-zinc-800 text-sm leading-tight">{admin?.name || "Admin"}</p>
                            <p className="text-xs text-zinc-400 mt-0.5 truncate w-full">{admin?.email}</p>
                            <span className={`mt-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${roleColor[admin?.role] || roleColor.admin}`}>
                                <FaUserShield size={9} />
                                {admin?.role?.charAt(0).toUpperCase() + admin?.role?.slice(1)}
                            </span>
                        </div>
                    </div>

                    {/* Nav */}
                    <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-sm">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-3 py-2">Menu</p>
                        <nav className="space-y-0.5">
                            {navItems.map(({ to, end, icon, label }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                                            ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                                            : "text-zinc-500 hover:text-zinc-900 hover:bg-stone-100"
                                        }`
                                    }
                                >
                                    {icon} {label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* Logout (sidebar) */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-200 bg-white text-red-400 text-sm font-semibold hover:bg-red-500 hover:text-white transition-all duration-200"
                    >
                        <FaSignOutAlt size={12} /> Sign Out
                    </button>
                </aside>

                {/* ── Main Content ── */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Admin;