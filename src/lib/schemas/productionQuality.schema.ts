import { z } from "zod";

export const createProductionQualitySchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const updateProductionQualitySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateProductionQualityInput = z.infer<
  typeof createProductionQualitySchema
>;
export type UpdateProductionQualityInput = z.infer<
  typeof updateProductionQualitySchema
>;
