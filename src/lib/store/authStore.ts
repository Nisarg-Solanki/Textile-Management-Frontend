import { create } from "zustand";
import type { AuthUser, Permission } from "@/types/app";

export type { AuthUser, Permission };

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  permissions: Permission[];
  setAuth: (user: AuthUser, token: string, permissions: Permission[]) => void;
  setToken: (token: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  permissions: [],
  setAuth: (user, accessToken, permissions) =>
    set({ user, accessToken, permissions }),
  setToken: (accessToken) => set({ accessToken }),
  clear: () => set({ user: null, accessToken: null, permissions: [] }),
}));
