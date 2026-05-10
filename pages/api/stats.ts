import prisma from '@/lib/prisma';
import { success, serverError } from '@/lib/response';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return;

  try {
    const [companyCount, reviewStats] = await Promise.all([
      prisma.company.count({ where: { isActive: true } }),
      prisma.review.aggregate({
        where: { status: 'PUBLISHED', isPublished: true },
        _count: true,
        _avg: { rating: true },
      }),
    ]);

    return success(res, {
      companies: companyCount,
      reviews: reviewStats._count,
      avgRating: reviewStats._avg.rating ? Math.round(reviewStats._avg.rating * 10) / 10 : 0,
    });
  } catch (error) {
    return serverError(res, 'Failed to fetch stats');
  }
}
