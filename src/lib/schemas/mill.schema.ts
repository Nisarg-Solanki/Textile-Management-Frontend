import { z } from "zod";

export const createMillSchema = z.object({
  millName: z.string().min(1, "Mill name is required"),
  millCode: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
});

export const updateMillSchema = z.object({
  millName: z.string().min(1, "Mill name is required").optional(),
  millCode: z.string().optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type CreateMillInput = z.infer<typeof createMillSchema>;
export type UpdateMillInput = z.infer<typeof updateMillSchema>;
