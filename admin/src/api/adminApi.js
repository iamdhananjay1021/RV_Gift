import axios from "axios";

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:9000/api",
    timeout: 15000,
});

adminApi.interceptors.request.use(
    (config) => {
        try {
            const stored = localStorage.getItem("adminAuth");
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed?.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`;
                }
            }
        } catch (err) {
            console.warn("Invalid adminAuth storage");
            localStorage.removeItem("adminAuth");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ✅ Track karo kitne 401 aaye — ek baar ka 401 ignore karo (race condition fix)
let consecutiveUnauthorized = 0;

adminApi.interceptors.response.use(
    (response) => {
        // ✅ Successful response — counter reset karo
        consecutiveUnauthorized = 0;
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            consecutiveUnauthorized++;

            const adminAuth = localStorage.getItem("adminAuth");

            // ✅ Sirf tab logout karo jab:
            // 1. Token storage mein hai
            // 2. Login endpoint pe NAHI ho (login ka 401 = wrong password)
            // 3. 2+ consecutive 401 aaye (genuine token expiry)
            const isLoginEndpoint = error.config?.url?.includes("/auth/login");

            if (adminAuth && !isLoginEndpoint && consecutiveUnauthorized >= 2) {
                console.warn("Admin token expired — logging out");
                consecutiveUnauthorized = 0;
                localStorage.removeItem("adminAuth");
                if (!window.location.pathname.includes("/admin/login")) {
                    window.location.replace("/admin/login");
                }
            } else if (adminAuth && !isLoginEndpoint) {
                // ✅ Pehla 401 — sirf warn karo, logout mat karo
                console.warn("401 on:", error.config?.url, "— waiting to confirm token expiry");
            }
        }

        if (error.response?.status === 403) {
            console.warn("Admin access denied:", error.config?.url);
            // ✅ 403 pe kabhi logout nahi
        }

        if (error.code === "ECONNABORTED") {
            error.message = "Request timeout. Please try again.";
        }

        if (!error.response) {
            error.message = "Network error. Check your internet.";
        }

        return Promise.reject(error);
    }
);

export default adminApi;