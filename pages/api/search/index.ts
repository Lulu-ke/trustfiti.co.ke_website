import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { success, badRequest, serverError } from "@/lib/response";

const searchSchema = z.object({
  q: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(20).default(5),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return badRequest(res, "Method not allowed");
  }

  try {
    const parsed = searchSchema.safeParse(req.query);
    if (!parsed.success) {
      return badRequest(res, "Invalid query", parsed.error.errors[0]?.message);
    }

    const { q, limit } = parsed.data;
    const term = q.trim();

    // Fetch companies matching name, industry, or description
    const [companies, categories] = await Promise.all([
      prisma.company.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term } },
            { industry: { contains: term } },
            { description: { contains: term } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          industry: true,
          city: true,
          averageRating: true,
          totalReviews: true,
          isVerified: true,
        },
        orderBy: [{ averageRating: "desc" }, { totalReviews: "desc" }],
        take: limit,
      }),

      prisma.category.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: term } },
            { description: { contains: term } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          _count: {
            select: { companies: true },
          },
        },
        orderBy: { name: "asc" },
        take: 3,
      }),
    ]);

    return success(res, { companies, categories });
  } catch (error) {
    console.error("Search error:", error);
    return serverError(res, "Search failed");
  }
}
