import axios from "axios";
import { useAuthStore } from "@/lib/store/authStore";
import { ROUTES } from "@/lib/routes";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          queue.push((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        const newToken: string = data.data.accessToken;
        useAuthStore.getState().setToken(newToken);
        queue.forEach((cb) => cb(newToken));
        queue = [];
        original.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().clear();
        if (typeof window !== "undefined") {
          // Clear the HttpOnly refreshToken cookie via the route handler so the
          // middleware does not redirect back to /dashboard (infinite loop).
          try {
            await fetch("/api/auth/clear", { method: "POST", credentials: "include" });
          } catch {
            // ignore — redirect regardless
          }
          window.location.href = ROUTES.LOGIN;
        }
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
