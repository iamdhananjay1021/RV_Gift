import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        const { name, email, password } = form;
        if (!name || !email || !password) return setError("All fields are required");
        if (password.length < 6) return setError("Password must be at least 6 characters");

        try {
            setLoading(true);
            setError("");
            await register(name.trim(), email.trim(), password);
            navigate("/", { replace: true });
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-stone-50 focus:bg-white transition-all";

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 bg-stone-50">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
                <h1 className="text-2xl font-black text-zinc-900 text-center mb-1">Create Account</h1>
                <p className="text-center text-sm text-zinc-400 mb-6">Join RV Gifts to start shopping</p>

                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2.5 rounded-xl">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Full Name</label>
                        <div className="relative">
                            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                            <input name="name" type="text" placeholder="e.g. Rahul Verma"
                                value={form.name} onChange={onChange} className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Email Address</label>
                        <div className="relative">
                            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                            <input name="email" type="email" placeholder="your@email.com"
                                value={form.email} onChange={onChange} className={inputClass} />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Password</label>
                        <div className="relative">
                            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                            <input name="password" type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 characters" value={form.password} onChange={onChange}
                                className="w-full pl-10 pr-12 py-3 border border-stone-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none bg-stone-50 focus:bg-white transition-all" />
                            <button type="button" onClick={() => setShowPassword(s => !s)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                                {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading}
                        className="w-full bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60 shadow-md shadow-amber-200">
                        {loading ? "Creating account..." : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-sm text-zinc-400 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-amber-600 font-bold hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;