import axios from "axios";

const adminApi = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:9000/api",
    timeout: 15000,
});

/* ===============================
   ATTACH ADMIN TOKEN
================================ */
adminApi.interceptors.request.use(
    (config) => {
        try {
            const stored = localStorage.getItem("adminAuth");
            if (stored) {
                const { token } = JSON.parse(stored);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch {
            localStorage.removeItem("adminAuth");
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/* ===============================
   HANDLE RESPONSES
================================ */
adminApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem("adminAuth");
            window.location.href = "/admin/login";
        }

        if (err.response?.status === 403) {
            window.location.href = "/admin/login";
        }

        if (err.code === "ECONNABORTED") {
            err.message = "Request timed out. Please try again.";
        }

        if (!err.response) {
            err.message = "Network error. Check your connection.";
        }

        return Promise.reject(err);
    }
);

export default adminApi;