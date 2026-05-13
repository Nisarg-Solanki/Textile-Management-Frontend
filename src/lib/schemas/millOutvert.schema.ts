import { z } from "zod";

export const createMillOutvertSchema = z.object({
  firmId: z.string().uuid("Please select a firm"),
  millId: z.string().uuid("Please select a mill"),
  outvertDate: z.date({ required_error: "Outvert date is required" }),
  firmChallanNo: z.string().min(1, "Firm challan number is required"),
  takaSrNos: z.array(z.string()).min(1, "Select at least one Taka Sr No"),
});

export const updateMillOutvertSchema = createMillOutvertSchema.partial();

export type CreateMillOutvertInput = z.infer<typeof createMillOutvertSchema>;
export type UpdateMillOutvertInput = z.infer<typeof updateMillOutvertSchema>;
