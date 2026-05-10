import type { NextApiRequest, NextApiResponse } from "next";
import { getCompaniesSchema } from "@/lib/validations/review";
import prisma from "@/lib/prisma";
import { badRequest, success, serverError } from "@/lib/response";

async function getCompanies(req: NextApiRequest, res: NextApiResponse) {
  try {
    const query = getCompaniesSchema.safeParse(req.query);
    if (!query.success) {
      return badRequest(res, "Invalid query parameters", query.error.errors[0]?.message);
    }

    const { search, industry, city, rating, page, limit, sortBy } = query.data;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {
      isActive: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { industry: { contains: search, mode: "insensitive" } },
      ];
    }

    if (industry) {
      where.industry = { contains: industry, mode: "insensitive" };
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (rating) {
      where.averageRating = { gte: rating };
    }

    // Build sort
    let orderBy: Record<string, string> = { averageRating: "desc" };
    if (sortBy === "reviews") {
      orderBy = { totalReviews: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logo: true,
          industry: true,
          city: true,
          country: true,
          averageRating: true,
          totalReviews: true,
          isVerified: true,
          isFeatured: true,
          isClaimed: true,
          createdAt: true,
        },
      }),
      prisma.company.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return success(
      res,
      companies,
      "Companies fetched successfully",
      { page, limit, total, totalPages }
    );
  } catch (error) {
    console.error("Get companies error:", error);
    return serverError(res, "Failed to fetch companies");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return badRequest(res, "Method not allowed");
  }

  return getCompanies(req, res);
}
