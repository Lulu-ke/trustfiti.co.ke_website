import { z } from "zod";

export const updateProfileSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
});

export const getUserReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(["PUBLISHED", "HIDDEN", "FLAGGED", "REMOVED"]).optional(),
});
