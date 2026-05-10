import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { flagReviewSchema } from "@/lib/validations/review";
import prisma from "@/lib/prisma";
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  created,
  serverError,
} from "@/lib/response";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return badRequest(res, "Method not allowed");
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  try {
    const { id } = req.query;
    if (typeof id !== "string") {
      return badRequest(res, "Invalid review ID");
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Validate body
    const body = flagReviewSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    // Check review exists
    const review = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        reviewerId: true,
        status: true,
        isPublished: true,
      },
    });

    if (!review) {
      return notFound(res, "Review not found");
    }

    // Check user is not the review author
    if (review.reviewerId === userId) {
      return badRequest(res, "You cannot flag your own review");
    }

    // Check user hasn't flagged this review already
    const existingFlag = await prisma.reviewFlag.findFirst({
      where: {
        reviewId: id,
        reporterId: userId,
      },
    });

    if (existingFlag) {
      return badRequest(res, "You have already flagged this review");
    }

    // Create the flag
    const flag = await prisma.reviewFlag.create({
      data: {
        reviewId: id,
        reporterId: userId,
        reason: body.data.reason,
        description: body.data.description,
        status: "PENDING",
      },
    });

    return created(res, flag, "Review flagged successfully");
  } catch (error) {
    console.error("Flag review error:", error);
    return serverError(res, "Failed to flag review");
  }
}
