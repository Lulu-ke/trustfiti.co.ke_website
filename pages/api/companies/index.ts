import type { NextApiRequest, NextApiResponse } from "next";
import { getCompaniesSchema, createCompanySchema } from "@/lib/validations/review";
import prisma from "@/lib/prisma";
import { badRequest, success, created, serverError } from "@/lib/response";
import { generateSlug } from "@/lib/utils";

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
        { name: { contains: search } },
        { description: { contains: search } },
        { industry: { contains: search } },
      ];
    }

    if (industry) {
      where.industry = { contains: industry };
    }

    if (city) {
      where.city = { contains: city };
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
    } else if (sortBy === "name") {
      orderBy = { name: "asc" };
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

async function createCompany(req: NextApiRequest, res: NextApiResponse) {
  try {
    const body = createCompanySchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid input", body.error.errors[0]?.message);
    }

    const { name, industry, website, city, description } = body.data;

    // Generate slug from name
    let slug = generateSlug(name);

    // Check for duplicate slug and append suffix if needed
    const existing = await prisma.company.findFirst({
      where: { slug },
      select: { id: true },
    });

    if (existing) {
      let suffix = 2;
      while (suffix < 100) {
        const candidate = `${slug}-${suffix}`;
        const candidateExists = await prisma.company.findFirst({
          where: { slug: candidate },
          select: { id: true },
        });
        if (!candidateExists) {
          slug = candidate;
          break;
        }
        suffix++;
      }
    }

    // Clean up empty strings to null
    const cleanWebsite = website && website.trim() !== "" ? website.trim() : null;
    const cleanCity = city && city.trim() !== "" ? city.trim() : null;
    const cleanIndustry = industry && industry.trim() !== "" ? industry.trim() : null;
    const cleanDescription = description && description.trim() !== "" ? description.trim() : null;

    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        slug,
        industry: cleanIndustry,
        website: cleanWebsite,
        city: cleanCity,
        description: cleanDescription,
        country: "Kenya",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        industry: true,
        city: true,
        country: true,
        description: true,
        website: true,
        logo: true,
        averageRating: true,
        totalReviews: true,
        isVerified: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
      },
    });

    return created(res, company, "Company added successfully");
  } catch (error) {
    console.error("Create company error:", error);
    return serverError(res, "Failed to create company");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getCompanies(req, res);
    case "POST":
      return createCompany(req, res);
    default:
      return badRequest(res, "Method not allowed");
  }
}
