import { getOne, put } from "@/lib/api/request";
import type { PermissionRow, PermissionsApiResponse } from "@/types/app";

export type { PermissionRow };

export async function getPermissions(adminId: string): Promise<PermissionRow[]> {
  const data = await getOne<PermissionsApiResponse>(`/permissions/${adminId}`);
  return data.permissions;
}

export function updatePermissions(
  adminId: string,
  data: PermissionRow[],
): Promise<PermissionRow[]> {
  return put<PermissionRow[], PermissionRow[]>(`/permissions/${adminId}`, data);
}
