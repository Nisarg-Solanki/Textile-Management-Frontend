import { z } from "zod";

export const createBeamSchema = z.object({
  beamNo: z.string().min(1, "Beam number is required"),
  tar: z.coerce.number().int().positive("Tar must be a positive integer"),
  beamQualityId: z.string().uuid("Please select a beam quality"),
  takaQty: z.coerce
    .number()
    .int()
    .positive("Taka quantity must be a positive integer"),
  beamMeter: z.coerce.number().positive("Beam meter must be positive"),
});

export const updateBeamSchema = createBeamSchema.partial();

export type CreateBeamInput = z.infer<typeof createBeamSchema>;
export type UpdateBeamInput = z.infer<typeof updateBeamSchema>;
