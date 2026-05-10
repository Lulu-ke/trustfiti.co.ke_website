import type { NextApiRequest, NextApiResponse } from "next";
import { sendOtpSchema } from "@/lib/validations/auth";
import { sendOTP } from "@/lib/talksasa";
import { otpRateLimitCache } from "@/lib/cache";
import { enqueue } from "@/lib/jobQueue";
import prisma from "@/lib/prisma";
import { badRequest, success, serverError } from "@/lib/response";

const OTP_EXPIRY_SECONDS = 300; // 5 minutes
const MAX_OTP_PER_HOUR = 3;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return badRequest(res, "Method not allowed");
  }

  try {
    // Parse and validate request body
    const body = sendOtpSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    const { phoneNumber } = body.data;

    // Rate limit check
    const rateLimitKey = `otp:${phoneNumber}`;
    const currentCount = otpRateLimitCache.get(rateLimitKey) as number | undefined;
    if (currentCount !== undefined && currentCount >= MAX_OTP_PER_HOUR) {
      return badRequest(
        res,
        "Too many OTP requests. Please try again after an hour."
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiry
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    // Create OTP record in database
    await prisma.otpVerification.create({
      data: {
        phoneNumber,
        code: otpCode,
        purpose: "LOGIN",
        expiresAt,
      },
    });

    // Update rate limit cache
    const newCount = (currentCount || 0) + 1;
    otpRateLimitCache.set(rateLimitKey, { count: newCount });

    // Enqueue SEND_OTP job for reliability
    await enqueue("SEND_OTP", {
      phoneNumber,
      otpCode,
    });

    // Also try sending directly for faster delivery
    sendOTP(phoneNumber, otpCode).catch((err) => {
      console.error("Direct OTP send failed (job queued as fallback):", err);
    });

    return success(
      res,
      { message: "OTP sent", expiresIn: OTP_EXPIRY_SECONDS },
      "OTP sent successfully"
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return serverError(res, "Failed to send OTP");
  }
}
