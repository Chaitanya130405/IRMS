import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  // Check both storages (remember me uses localStorage, otherwise sessionStorage)
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401) {
      const isAuthRoute = error.config?.url?.includes("/auth/");
      // Don't auto-logout for login/register failures
      if (!isAuthRoute || error.config?.url?.includes("/auth/me")) {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        // Only redirect if not already on login page
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;