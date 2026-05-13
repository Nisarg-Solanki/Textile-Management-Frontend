import { updatePermissions } from "@/lib/api/permissions";
import type { PermissionRow } from "@/types/app";

export async function updatePermissionsAction(
  adminId: string,
  data: PermissionRow[],
): Promise<PermissionRow[]> {
  return updatePermissions(adminId, data);
}
