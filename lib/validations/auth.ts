import { z } from "zod";

export const phoneSchema = z
  .string()
  .regex(/^\+254[17]\d{8}$/, "Phone number must be a valid Kenyan number (e.g., +254712345678)");

export const otpSchema = z
  .string()
  .length(6, "OTP must be 6 digits")
  .regex(/^\d{6}$/, "OTP must contain only digits");

export const sendOtpSchema = z.object({
  phoneNumber: phoneSchema,
});

export const verifyOtpSchema = z.object({
  phoneNumber: phoneSchema,
  code: otpSchema,
});

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters");

export const fullNameSchema = z
  .string()
  .min(1, "Full name is required")
  .max(100, "Full name must be less than 100 characters")
  .trim();

export const emailLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  action: z.literal("login"),
});

export const emailRegisterSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  fullName: fullNameSchema,
  action: z.literal("register"),
});

export const emailAuthSchema = z.discriminatedUnion("action", [
  emailLoginSchema,
  emailRegisterSchema,
]);
