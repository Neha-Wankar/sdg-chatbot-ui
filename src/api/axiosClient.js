import axios from "axios";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const axiosClient = axios.create({
  baseURL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 30000),
  headers: { Accept: "application/json" }
});

// Request interceptor:
// - adds API key when configured
// - adds bearer token from the existing login flow
axiosClient.interceptors.request.use((config) => {
    const apiKey = import.meta.env.VITE_API_KEY;
    if (apiKey) config.headers["X-API-Key"] = apiKey;
    const token = sessionStorage.getItem("sdg_auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor:
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      sessionStorage.removeItem("sdg_authenticated");
      sessionStorage.removeItem("sdg_auth_token");
      sessionStorage.removeItem("sdg_username");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
