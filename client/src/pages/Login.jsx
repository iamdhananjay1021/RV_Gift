import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!loading && user) navigate("/", { replace: true });
    }, [user, loading, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!email || !password) return setError("Email and password are required");
        try {
            setSubmitting(true);
            setError("");
            await login(email.trim(), password);
        } catch (err) {
            setError(err.response?.data?.message || "Invalid email or password");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-stone-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                <h2 className="text-2xl font-black text-zinc-900 text-center mb-1">Welcome Back</h2>
                <p className="text-center text-sm text-zinc-400 mb-6">Login to your RV Gifts account</p>

                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-xl">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                                placeholder="your@email.com"
                                className="w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-stone-50 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                                placeholder="Enter your password"
                                className="w-full pl-10 pr-12 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-stone-50 focus:bg-white transition-all"
                            />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={submitting}
                        className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 shadow-md shadow-amber-200">
                        {submitting ? "Logging in..." : "Login"}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-400 mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-amber-600 font-bold hover:underline">Create Account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;