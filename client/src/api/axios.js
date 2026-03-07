import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:9000/api";

const api = axios.create({
  baseURL,
  timeout: 60000, // ✅ 60 sec — Render cold start handle karega
});

api.interceptors.request.use(
  (config) => {
    try {
      const stored = localStorage.getItem("auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token) {
          config.headers.Authorization = `Bearer ${parsed.token}`;
        }
      }
    } catch {
      localStorage.removeItem("auth");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("User token expired");
      localStorage.removeItem("auth");
    }

    if (error.code === "ECONNABORTED") {
      error.message = "Request timed out. Please try again.";
    }

    if (!error.response) {
      error.message = "Network error. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;