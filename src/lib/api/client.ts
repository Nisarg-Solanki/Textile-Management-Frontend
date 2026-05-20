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
        // Go through the same-origin Next.js proxy route so the HttpOnly
        // refreshToken cookie can be read server-side and forwarded to the
        // backend. Calling backend /auth/refresh directly from the browser
        // fails in production because the refresh cookie lives on the
        // frontend domain and is not sent cross-origin.
        const { data } = await axios.post(
          "/api/auth/refresh",
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
          // Best-effort delete of the HttpOnly refreshToken cookie. The
          // ?session=expired flag below is the absolute fallback — even if
          // the delete fails, the middleware lets the user reach /login.
          try {
            await fetch("/api/auth/clear", {
              method: "POST",
              credentials: "include",
            });
          } catch {
            // ignore — escape-hatch query param handles it
          }
          window.location.replace(`${ROUTES.LOGIN}?session=expired`);
        }
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
