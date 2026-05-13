import { z } from "zod";

export const createMachineSchema = z.object({
  firmId: z.string().uuid("Please select a firm"),
  machineNo: z.string().min(1, "Machine number is required"),
  machineType: z.string().optional(),
  remark: z.string().optional(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export const updateMachineSchema = createMachineSchema.partial();

export type CreateMachineInput = z.infer<typeof createMachineSchema>;
export type UpdateMachineInput = z.infer<typeof updateMachineSchema>;
