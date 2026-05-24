import { z } from "zod";

// Shared password validation — used by both register and reset-password
const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const confirmPasswordValidation = z
  .string()
  .min(1, "Please confirm your password");

const passwordsMatchRefinement = {
  message: "Passwords do not match",
  path: ["confirmPassword"],
};

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const registerSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation,
  })
  .refine((data) => data.password === data.confirmPassword, passwordsMatchRefinement);

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z
  .object({
    password: passwordValidation,
    confirmPassword: confirmPasswordValidation,
  })
  .refine((data) => data.password === data.confirmPassword, passwordsMatchRefinement);

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
