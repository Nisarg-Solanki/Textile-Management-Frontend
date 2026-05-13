import { z } from "zod";

export const createBeamQualitySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateBeamQualitySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateBeamQualityInput = z.infer<typeof createBeamQualitySchema>;
export type UpdateBeamQualityInput = z.infer<typeof updateBeamQualitySchema>;
