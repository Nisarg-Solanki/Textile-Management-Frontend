import { useAuthStore, type AuthUser } from "@/lib/store/authStore";

type UseAuthReturn = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
};

export function useAuth(): UseAuthReturn {
  const user = useAuthStore((s) => s.user);
  return {
    user,
    isAuthenticated: user !== null,
    isSuperAdmin: user?.role === "super_admin",
  };
}
