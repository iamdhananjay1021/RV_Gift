import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /* ── Init from localStorage ── */
    useEffect(() => {
        try {
            const stored = localStorage.getItem("auth");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.user && parsed?.token) {
                    setUser(parsed.user);
                } else {
                    localStorage.removeItem("auth"); // corrupted shape
                }
            }
        } catch {
            localStorage.removeItem("auth"); // invalid JSON
        } finally {
            setLoading(false);
        }
    }, []);

    /* ── Login ── */
    const login = async (email, password) => {
        const { data } = await api.post("/auth/login", { email, password });

        const authData = {
            token: data.token,
            user: {
                _id: data._id,
                name: data.name,
                email: data.email,
                role: data.role,
            },
        };

        localStorage.setItem("auth", JSON.stringify(authData));
        setUser(authData.user);
    };

    /* ── Register ── */
    const register = async (name, email, password) => {
        const { data } = await api.post("/auth/register", { name, email, password });

        const authData = {
            token: data.token,
            user: {
                _id: data._id,
                name: data.name,
                email: data.email,
                role: data.role,
            },
        };

        localStorage.setItem("auth", JSON.stringify(authData));
        setUser(authData.user);
    };

    /* ── Logout ── */
    const logout = () => {
        localStorage.removeItem("auth");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);