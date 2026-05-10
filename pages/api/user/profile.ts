import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations/profile";
import prisma from "@/lib/prisma";
import {
  badRequest,
  unauthorized,
  notFound,
  success,
  serverError,
} from "@/lib/response";

// GET /api/user/profile — Auth required: get current user profile
async function getProfile(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  try {
    const userId = (session.user as Record<string, unknown>).id as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return notFound(res, "User not found");
    }

    // Calculate user stats: total reviews and average rating given
    const reviewStats = await prisma.review.aggregate({
      where: {
        reviewerId: userId,
        status: { not: "REMOVED" },
      },
      _count: true,
      _avg: { rating: true },
    });

    return success(res, {
      ...user,
      stats: {
        totalReviews: reviewStats._count,
        averageRating: reviewStats._avg.rating
          ? Math.round(reviewStats._avg.rating * 10) / 10
          : 0,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return serverError(res, "Failed to fetch profile");
  }
}

// PUT /api/user/profile — Auth required: update profile
async function updateProfile(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  try {
    const userId = (session.user as Record<string, unknown>).id as string;

    const body = updateProfileSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    // Build update data (filter out empty strings for email)
    const updateData: Record<string, string | null> = {};
    if (body.data.fullName !== undefined) {
      updateData.fullName = body.data.fullName;
    }
    if (body.data.email !== undefined) {
      updateData.email = body.data.email === "" ? null : body.data.email;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        phoneNumber: true,
        fullName: true,
        email: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return success(res, updatedUser, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return serverError(res, "Failed to update profile");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getProfile(req, res);
    case "PUT":
      return updateProfile(req, res);
    default:
      return badRequest(res, "Method not allowed");
  }
}
