import { useAuthStore } from "@/lib/store/authStore";

type Action = "view" | "create" | "edit" | "delete";
type Module =
  | "firms"
  | "mills"
  | "beam_qualities"
  | "production_qualities"
  | "machines"
  | "beams"
  | "production"
  | "takas"
  | "mill_outverts"
  | "mill_inverts"
  | "machine_info"
  | "mill_summary";

const ACTION_MAP: Record<
  Action,
  "canView" | "canCreate" | "canEdit" | "canDelete"
> = {
  view: "canView",
  create: "canCreate",
  edit: "canEdit",
  delete: "canDelete",
};

export function usePermission(module: Module, action: Action): boolean {
  const { user, permissions } = useAuthStore();
  if (!user) return false;
  if (user.role === "super_admin") return true;
  const perm = permissions.find((p) => p.module === module);
  if (!perm) return false;
  return perm[ACTION_MAP[action]];
}

export function useIsSuperAdmin(): boolean {
  const user = useAuthStore((s) => s.user);
  return user?.role === "super_admin";
}
