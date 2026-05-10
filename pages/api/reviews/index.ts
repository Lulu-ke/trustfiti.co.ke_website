import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getReviewsSchema, createReviewSchema } from "@/lib/validations/review";
import prisma from "@/lib/prisma";
import { enqueue } from "@/lib/jobQueue";
import {
  badRequest,
  unauthorized,
  forbidden,
  success,
  created,
  serverError,
} from "@/lib/response";

// GET /api/reviews — Public: list published reviews
async function getReviews(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = getReviewsSchema.safeParse(req.query);
    if (!query.success) {
      return badRequest(res, "Invalid query parameters", query.error.errors[0]?.message);
    }

    const { companyId, rating, page, limit, sortBy } = query.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      status: "PUBLISHED",
      isPublished: true,
    };

    if (companyId) {
      where.companyId = companyId;
    }
    if (rating) {
      where.rating = rating;
    }

    // Build sort
    let orderBy: Record<string, string> = { createdAt: "desc" };
    if (sortBy === "highest") {
      orderBy = { rating: "desc" };
    } else if (sortBy === "lowest") {
      orderBy = { rating: "asc" };
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          rating: true,
          title: true,
          content: true,
          isFeatured: true,
          createdAt: true,
          updatedAt: true,
          reviewer: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
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
      "Reviews fetched successfully",
      { page, limit, total, totalPages }
    );
  } catch (error) {
    console.error("Get reviews error:", error);
    return serverError(res, "Failed to fetch reviews");
  }
}

// POST /api/reviews — Auth required (REVIEWER): create review
async function createReview(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  if ((session.user as Record<string, unknown>).role !== "REVIEWER") {
    return forbidden(res, "Only reviewers can create reviews");
  }

  try {
    const body = createReviewSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    const { companyId, rating, title, content } = body.data;
    const userId = (session.user as Record<string, unknown>).id as string;

    // Check company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true, name: true, ownerId: true, isActive: true },
    });

    if (!company || !company.isActive) {
      return badRequest(res, "Company not found or inactive");
    }

    // Check if user already reviewed this company
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: userId,
        companyId,
        status: { not: "REMOVED" },
      },
    });

    if (existingReview) {
      return badRequest(res, "You have already reviewed this company");
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        rating,
        title,
        content,
        reviewerId: userId,
        companyId,
        status: "PUBLISHED",
        isPublished: true,
      },
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

    // Enqueue recalculation job
    await enqueue("RECALCULATE_COMPANY_RATING", {
      companyId,
    });

    // Create notification for company owner if exists
    if (company.ownerId) {
      await prisma.notification.create({
        data: {
          userId: company.ownerId,
          type: "REVIEW_PUBLISHED",
          title: "New Review",
          message: `A new review has been posted on ${company.name}.`,
          metadata: {
            reviewId: review.id,
            companyId,
            rating,
          },
        },
      });
    }

    return created(res, review, "Review created successfully");
  } catch (error) {
    console.error("Create review error:", error);
    return serverError(res, "Failed to create review");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getReviews(req, res);
    case "POST":
      return createReview(req, res);
    default:
      return badRequest(res, "Method not allowed");
  }
}
