import { z } from "zod";

export const createReviewSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  rating: z.number().int().min(1, "Minimum rating is 1").max(5, "Maximum rating is 5"),
  title: z.string().max(200, "Title must be under 200 characters").optional(),
  content: z
    .string()
    .min(20, "Review must be at least 20 characters")
    .max(2000, "Review must be under 2000 characters"),
});

export const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(200).optional(),
  content: z.string().min(20).max(2000).optional(),
});

export const flagReviewSchema = z.object({
  reason: z.enum(["SPAM", "INAPPROPRIATE", "FAKE", "OFF_TOPIC", "OTHER"]),
  description: z.string().max(500).optional(),
});

export const reviewReplySchema = z.object({
  content: z
    .string()
    .min(10, "Reply must be at least 10 characters")
    .max(1000, "Reply must be under 1000 characters"),
});

export const getReviewsSchema = z.object({
  companyId: z.string().optional(),
  rating: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(["newest", "highest", "lowest"]).default("newest"),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().max(100, "Industry must be under 100 characters").optional(),
  website: z
    .string()
    .url("Must be a valid URL")
    .max(255, "Website must be under 255 characters")
    .optional()
    .or(z.literal("")),
  city: z.string().max(100, "City must be under 100 characters").optional(),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional(),
});

export const getCompaniesSchema = z.object({
  q: z.string().optional(),
  search: z.string().optional(),
  industry: z.string().optional(),
  city: z.string().optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  sortBy: z.enum(["rating", "reviews", "newest"]).default("rating"),
}).transform((data) => ({
  // Support both `q` and `search` params; `q` takes priority
  ...data,
  search: data.q || data.search || undefined,
}));
