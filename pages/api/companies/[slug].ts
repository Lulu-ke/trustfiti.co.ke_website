import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { badRequest, notFound, success, serverError } from "@/lib/response";

async function getCompanyBySlug(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { slug } = req.query;
    if (typeof slug !== "string") {
      return badRequest(res, "Invalid company slug");
    }

    // Find company by slug (isActive=true)
    const company = await prisma.company.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logo: true,
        coverImage: true,
        website: true,
        industry: true,
        address: true,
        city: true,
        country: true,
        averageRating: true,
        totalReviews: true,
        isVerified: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    if (!company || !company.isActive) {
      return notFound(res, "Company not found");
    }

    // Get recent 5 published reviews
    const reviews = await prisma.review.findMany({
      where: {
        companyId: company.id,
        status: "PUBLISHED",
        isPublished: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        rating: true,
        title: true,
        content: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        reviewer: {
          select: { id: true, fullName: true, avatar: true },
        },
        _count: {
          select: { flags: true, replies: true },
        },
      },
    });

    // Get rating distribution (count per star)
    const ratingDistributionRaw = await prisma.review.groupBy({
      by: ["rating"],
      where: {
        companyId: company.id,
        status: "PUBLISHED",
        isPublished: true,
      },
      _count: {
        rating: true,
      },
    });

    // Build rating distribution object { 1: count, 2: count, ... }
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const item of ratingDistributionRaw) {
      ratingDistribution[item.rating] = item._count.rating;
    }

    return success(
      res,
      {
        ...company,
        reviews,
        ratingDistribution,
      },
      "Company fetched successfully"
    );
  } catch (error) {
    console.error("Get company error:", error);
    return serverError(res, "Failed to fetch company");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return badRequest(res, "Method not allowed");
  }

  return getCompanyBySlug(req, res);
}
