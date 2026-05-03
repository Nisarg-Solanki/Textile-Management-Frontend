import { create } from "zustand";

export type Permission = {
  module: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
  status: string;
};

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
