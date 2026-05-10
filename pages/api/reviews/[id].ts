import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateReviewSchema } from "@/lib/validations/review";
import prisma from "@/lib/prisma";
import { enqueue } from "@/lib/jobQueue";
import {
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  success,
  serverError,
} from "@/lib/response";

const EDIT_WINDOW_HOURS = 48;

// GET /api/reviews/[id] — Public: get single review
async function getReview(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    if (typeof id !== "string") {
      return badRequest(res, "Invalid review ID");
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        reviewer: {
          select: { id: true, fullName: true, avatar: true },
        },
        company: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
            industry: true,
            isVerified: true,
          },
        },
        replies: {
          include: {
            author: {
              select: { id: true, fullName: true, avatar: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: {
            flags: true,
            replies: true,
          },
        },
      },
    });

    if (!review) {
      return notFound(res, "Review not found");
    }

    return success(res, review, "Review fetched successfully");
  } catch (error) {
    console.error("Get review error:", error);
    return serverError(res, "Failed to fetch review");
  }
}

// PUT /api/reviews/[id] — Auth required (REVIEWER, owner): update review
async function updateReview(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  if ((session.user as Record<string, unknown>).role !== "REVIEWER") {
    return forbidden(res, "Only reviewers can edit reviews");
  }

  try {
    const { id } = req.query;
    if (typeof id !== "string") {
      return badRequest(res, "Invalid review ID");
    }

    // Validate body
    const body = updateReviewSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Check review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        reviewerId: true,
        companyId: true,
        createdAt: true,
        status: true,
      },
    });

    if (!existingReview) {
      return notFound(res, "Review not found");
    }

    if (existingReview.reviewerId !== userId) {
      return forbidden(res, "You can only edit your own reviews");
    }

    // Check 48-hour edit window
    const editWindowMs = EDIT_WINDOW_HOURS * 60 * 60 * 1000;
    const timeSinceCreation = Date.now() - new Date(existingReview.createdAt).getTime();
    if (timeSinceCreation > editWindowMs) {
      return badRequest(
        res,
        `Reviews can only be edited within ${EDIT_WINDOW_HOURS} hours of posting`
      );
    }

    if (existingReview.status === "REMOVED") {
      return badRequest(res, "Cannot edit a removed review");
    }

    // Update review
    const review = await prisma.review.update({
      where: { id },
      data: body.data,
      include: {
        reviewer: {
          select: { id: true, fullName: true, avatar: true },
        },
        company: {
          select: { id: true, name: true, slug: true, logo: true, industry: true },
        },
        _count: {
          select: { flags: true, replies: true },
        },
      },
    });

    // Enqueue recalculation job if rating changed
    if (body.data.rating !== undefined) {
      await enqueue("RECALCULATE_COMPANY_RATING", {
        companyId: existingReview.companyId,
      });
    }

    return success(res, review, "Review updated successfully");
  } catch (error) {
    console.error("Update review error:", error);
    return serverError(res, "Failed to update review");
  }
}

// DELETE /api/reviews/[id] — Auth required (REVIEWER, owner): soft delete review
async function deleteReview(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  if ((session.user as Record<string, unknown>).role !== "REVIEWER") {
    return forbidden(res, "Only reviewers can delete reviews");
  }

  try {
    const { id } = req.query;
    if (typeof id !== "string") {
      return badRequest(res, "Invalid review ID");
    }

    const userId = (session.user as Record<string, unknown>).id as string;

    // Check review exists and belongs to user
    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: {
        id: true,
        reviewerId: true,
        companyId: true,
        status: true,
        company: { select: { name: true, ownerId: true } },
      },
    });

    if (!existingReview) {
      return notFound(res, "Review not found");
    }

    if (existingReview.reviewerId !== userId) {
      return forbidden(res, "You can only delete your own reviews");
    }

    if (existingReview.status === "REMOVED") {
      return badRequest(res, "Review has already been removed");
    }

    // Soft delete: set status=REMOVED, isPublished=false
    await prisma.review.update({
      where: { id },
      data: {
        status: "REMOVED",
        isPublished: false,
      },
    });

    // Enqueue recalculation job
    await enqueue("RECALCULATE_COMPANY_RATING", {
      companyId: existingReview.companyId,
    });

    // Notify company owner if exists
    if (existingReview.company.ownerId) {
      await prisma.notification.create({
        data: {
          userId: existingReview.company.ownerId,
          type: "REVIEW_REMOVED",
          title: "Review Removed",
          message: `A review on ${existingReview.company.name} has been removed by the reviewer.`,
          metadata: {
            reviewId: id,
            companyId: existingReview.companyId,
          },
        },
      });
    }

    return success(res, { id }, "Review removed successfully");
  } catch (error) {
    console.error("Delete review error:", error);
    return serverError(res, "Failed to delete review");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getReview(req, res);
    case "PUT":
      return updateReview(req, res);
    case "DELETE":
      return deleteReview(req, res);
    default:
      return badRequest(res, "Method not allowed");
  }
}
