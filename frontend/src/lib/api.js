import axios from "axios";

// ✅ FIXED BACKEND URL
const API_URL = "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: `${API_URL}/api`, // ✅ IMPORTANT
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log("API request", config.method, config.url, config.data, { headers: config.headers });
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ Handle 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      try {
        await api.post("/auth/refresh");
        return api(error.config);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ✅ Format error messages
export function formatApiErrorDetail(detail) {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) =>
        e && typeof e.msg === "string" ? e.msg : JSON.stringify(e)
      )
      .filter(Boolean)
      .join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default api;