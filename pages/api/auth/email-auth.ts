import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { emailAuthSchema } from "@/lib/validations/auth";
import prisma from "@/lib/prisma";
import { badRequest, created, success, serverError } from "@/lib/response";

const SALT_ROUNDS = 12;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return badRequest(res, "Method not allowed");
  }

  try {
    const body = emailAuthSchema.safeParse(req.body);
    if (!body.success) {
      const firstError = body.error.errors[0];
      return badRequest(
        res,
        "Validation failed",
        firstError?.message || "Invalid request"
      );
    }

    const { action } = body.data;

    if (action === "register") {
      const { email, password, fullName } = body.data;

      // Check if email is already taken
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return badRequest(res, "An account with this email already exists");
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Generate a placeholder phone number since the field is required and unique
      const placeholderPhone = `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          phoneNumber: placeholderPhone,
          role: "REVIEWER",
          isVerified: true,
        },
      });

      return created(
        res,
        {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
          },
        },
        "Account created successfully"
      );
    }

    if (action === "login") {
      const { email, password } = body.data;

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return badRequest(res, "Invalid email or password");
      }

      if (!user.isActive) {
        return badRequest(res, "Account is deactivated");
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return badRequest(res, "Invalid email or password");
      }

      return success(
        res,
        {
          user: {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            phoneNumber: user.phoneNumber,
          },
        },
        "Login successful"
      );
    }
  } catch (error) {
    console.error("Email auth error:", error);
    return serverError(res, "Authentication failed");
  }
}
