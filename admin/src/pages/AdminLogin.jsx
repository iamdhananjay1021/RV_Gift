import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../auth/AdminAuthContext";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGift } from "react-icons/fa";

const AdminLogin = () => {
    const { login } = useAdminAuth();
    const navigate = useNavigate(); // ✅
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError("Email and password required");
        try {
            setLoading(true);
            setError("");
            await login(email.trim(), password);
            navigate("/admin", { replace: true }); // ✅
        } catch (err) {
            setError(err.response?.data?.message || err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 px-4"
            style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

            <div className="w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-200 mb-3">
                        <FaGift size={24} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-zinc-900">RVGifts Admin</h1>
                    <p className="text-zinc-400 text-sm mt-0.5">Sign in to your admin panel</p>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

                    <form onSubmit={submit} className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2.5 rounded-xl text-sm font-medium">
                                ⚠️ {error}
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                                Email Address
                            </label>
                            <div className="relative">
                                <FaEnvelope size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type="email"
                                    placeholder="admin@rvgifts.com"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                    className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wide mb-1.5 block">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                    className="w-full pl-10 pr-12 py-3 border border-stone-200 rounded-xl text-sm bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white font-black text-sm rounded-xl transition-all disabled:opacity-60 shadow-md shadow-amber-200 flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : "Sign In"}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-zinc-400 mt-4">
                    🔒 Restricted access — Admin & Owner only
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;