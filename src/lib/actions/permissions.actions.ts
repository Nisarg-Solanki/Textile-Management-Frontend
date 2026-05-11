"use server";

import { updatePermissions } from "@/lib/api/permissions";
import type { PermissionRow } from "@/types/app";
import { revalidatePath } from "next/cache";
import { ROUTES } from "@/lib/routes";

export async function updatePermissionsAction(
  adminId: string,
  data: PermissionRow[],
): Promise<PermissionRow[]> {
  const result = await updatePermissions(adminId, data);
  revalidatePath(ROUTES.ADMIN.PERMISSIONS(adminId));
  return result;
}
