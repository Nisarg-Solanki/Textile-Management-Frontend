import { z } from "zod";

export const permissionRowSchema = z.object({
  module: z.string(),
  canView: z.boolean(),
  canCreate: z.boolean(),
  canEdit: z.boolean(),
  canDelete: z.boolean(),
});

export const updatePermissionsSchema = z.array(permissionRowSchema);

export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>;
