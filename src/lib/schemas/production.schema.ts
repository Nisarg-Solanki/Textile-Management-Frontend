import { z } from "zod";

export const createProductionSchema = z.object({
  firmId: z.string().uuid("Please select a firm"),
  machineId: z.string().uuid("Please select a machine"),
  beamId: z.string().uuid("Please select a beam"),
  entryDate: z.date({ required_error: "Entry date is required" }),
  takaSrNo: z.string().min(1, "Taka serial number is required"),
  takaMeter: z.coerce.number().positive("Taka meter must be positive"),
  productionQualityId: z.string().uuid("Please select a production quality"),
  weight: z.coerce.number().positive("Weight must be positive"),
  remark: z.string().optional(),
  productionChallanNo: z.string().optional(),
});

export const updateProductionSchema = createProductionSchema.partial();

export type CreateProductionInput = z.infer<typeof createProductionSchema>;
export type UpdateProductionInput = z.infer<typeof updateProductionSchema>;
