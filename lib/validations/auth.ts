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
