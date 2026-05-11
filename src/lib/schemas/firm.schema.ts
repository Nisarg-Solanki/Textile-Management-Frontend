import { z } from "zod";

export const createFirmSchema = z.object({
  firmName: z.string().min(1, "Firm name is required"),
  firmCode: z.string().min(1, "Firm code is required"),
  challanEnable: z.boolean(),
  srNoSeries: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const updateFirmSchema = z.object({
  firmName: z.string().min(1, "Firm name is required").optional(),
  firmCode: z.string().min(1, "Firm code is required").optional(),
  challanEnable: z.boolean().optional(),
  srNoSeries: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateFirmInput = z.infer<typeof createFirmSchema>;
export type UpdateFirmInput = z.infer<typeof updateFirmSchema>;
