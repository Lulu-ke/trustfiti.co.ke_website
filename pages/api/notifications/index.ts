import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  badRequest,
  unauthorized,
  success,
  serverError,
} from "@/lib/response";

const getNotificationsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  unreadOnly: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

const markAsReadSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(50),
});

// GET /api/notifications — Auth required: list notifications
async function getNotifications(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  try {
    const query = getNotificationsSchema.safeParse(req.query);
    if (!query.success) {
      return badRequest(res, "Invalid query parameters", query.error.errors[0]?.message);
    }

    const { page, limit, unreadOnly } = query.data;
    const userId = (session.user as Record<string, unknown>).id as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          isRead: true,
          createdAt: true,
          metadata: true,
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return success(
      res,
      {
        notifications,
        unreadCount,
      },
      "Notifications fetched successfully",
      { page, limit, total, totalPages }
    );
  } catch (error) {
    console.error("Get notifications error:", error);
    return serverError(res, "Failed to fetch notifications");
  }
}

// PUT /api/notifications — Auth required: mark notifications as read
async function markAsRead(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user) {
    return unauthorized(res);
  }

  try {
    const userId = (session.user as Record<string, unknown>).id as string;

    const body = markAsReadSchema.safeParse(req.body);
    if (!body.success) {
      return badRequest(res, "Invalid request", body.error.errors[0]?.message);
    }

    // Mark specified notifications as read (only if they belong to this user)
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: body.data.ids },
        userId,
      },
      data: { isRead: true },
    });

    return success(
      res,
      { markedCount: result.count },
      `${result.count} notification(s) marked as read`
    );
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return serverError(res, "Failed to mark notifications as read");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case "GET":
      return getNotifications(req, res);
    case "PUT":
      return markAsRead(req, res);
    default:
      return badRequest(res, "Method not allowed");
  }
}
