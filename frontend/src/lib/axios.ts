import { useAuthStore } from "@/stores/useAuthStore";
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.MODE == "development" ? "http://localhost:5001/api" : "api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalResquest = err.config;

    if (
      originalResquest.url.includes("/auth/sigin") ||
      originalResquest.url.includes("/auth/sigup") ||
      originalResquest.url.includes("/auth/refresh")
    ) {
      return Promise.reject.apply(err);
    }
    originalResquest._retryCount = originalResquest._retryCount || 0;

    if (err.response?.status === 403 && originalResquest._retryCount < 4) {
      originalResquest._retryCount += 1;

      try {
        const res = await api.post("/auth/refresh", { withCredentials: true });
        const newAccessToken = res.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);

        originalResquest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalResquest);
      } catch (refreshError) {
        useAuthStore.getState().clearState();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(err);
  },
);

export default api;
