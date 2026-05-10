import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserReviewsSchema } from "@/lib/validations/profile";
import prisma from "@/lib/prisma";
import {
  badRequest,
  unauthorized,
  forbidden,
  success,
  serverError,
} from "@/lib/response";

async function getUserReviews(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  if ((session.user as Record<string, unknown>).role !== "REVIEWER") {
    return forbidden(res, "Only reviewers can access this endpoint");
  }

  try {
    const query = getUserReviewsSchema.safeParse(req.query);
    if (!query.success) {
      return badRequest(res, "Invalid query parameters", query.error.errors[0]?.message);
    }

    const { page, limit, status } = query.data;
    const userId = (session.user as Record<string, unknown>).id as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      reviewerId: userId,
    };

    if (status) {
      where.status = status;
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          isFeatured: true,
          isPublished: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logo: true,
              industry: true,
            },
          },
          _count: {
            select: {
              flags: true,
              replies: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return success(
      res,
      reviews,
      "User reviews fetched successfully",
      { page, limit, total, totalPages }
    );
  } catch (error) {
    console.error("Get user reviews error:", error);
    return serverError(res, "Failed to fetch user reviews");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return badRequest(res, "Method not allowed");
  }

  return getUserReviews(req, res);
}
