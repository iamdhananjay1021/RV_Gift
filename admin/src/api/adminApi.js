import axios from "axios";

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:9000/api",
    timeout: 60000, // ✅ 60 sec — Render cold start
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

let consecutiveUnauthorized = 0;

adminApi.interceptors.response.use(
    (response) => {
        consecutiveUnauthorized = 0;
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            consecutiveUnauthorized++;

            const adminAuth = localStorage.getItem("adminAuth");
            const isLoginEndpoint = error.config?.url?.includes("/auth/login");

            if (adminAuth && !isLoginEndpoint && consecutiveUnauthorized >= 2) {
                console.warn("Admin token expired — logging out");
                consecutiveUnauthorized = 0;
                localStorage.removeItem("adminAuth");
                if (!window.location.pathname.includes("/admin/login")) {
                    window.location.replace("/admin/login");
                }
            }
        }

        if (error.response?.status === 403) {
            console.warn("Admin access denied:", error.config?.url);
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