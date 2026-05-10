import type { NextApiRequest, NextApiResponse } from "next";
import { verifyOtpSchema } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import { badRequest, success, serverError, notFound } from "@/lib/response";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return badRequest(res, "Method not allowed");
  }

  try {
    // Parse and validate request body
    const body = verifyOtpSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    const { phoneNumber, code } = body.data;

    // Find the latest unexpired OTP verification for this phone and purpose=LOGIN
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        phoneNumber,
        purpose: "LOGIN",
        verifiedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return badRequest(
        res,
        "No valid OTP found. Please request a new one."
      );
    }

    // Check max attempts
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return badRequest(
        res,
        "Maximum verification attempts exceeded. Please request a new OTP."
      );
    }

    // Verify code matches
    if (otpRecord.code !== code) {
      // Increment attempts
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = otpRecord.maxAttempts - (otpRecord.attempts + 1);
      return badRequest(
        res,
        `Invalid OTP code. ${remainingAttempts} attempt(s) remaining.`
      );
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date() },
    });

    // Find or create user with role=REVIEWER
    let user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber,
          role: "REVIEWER",
          isVerified: true,
        },
      });
    } else if (!user.isVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true },
      });
      user.isVerified = true;
    }

    // Generate a session token for NextAuth
    // The client will use this to sign in via the credentials provider
    const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

    return success(res, {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
      token: sessionToken,
    }, "OTP verified successfully");
  } catch (error) {
    console.error("Verify OTP error:", error);
    return serverError(res, "Failed to verify OTP");
  }
}
