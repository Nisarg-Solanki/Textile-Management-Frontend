import { z } from "zod";

export const createMillInvertSchema = z.object({
  firmId: z.string().uuid("Please select a firm"),
  millId: z.string().uuid("Please select a mill"),
  millOutvertId: z.string().uuid("Please select an outvert"),
  invertDate: z.date({ required_error: "Invert date is required" }),
  millChallanNo: z.string().min(1, "Mill challan number is required"),
  firmChallanNo: z.string().min(1),
  takaSrNos: z.array(z.string()).min(1, "Select at least one Taka Sr No"),
});

export const updateMillInvertSchema = createMillInvertSchema.partial();

export type CreateMillInvertInput = z.infer<typeof createMillInvertSchema>;
export type UpdateMillInvertInput = z.infer<typeof updateMillInvertSchema>;
