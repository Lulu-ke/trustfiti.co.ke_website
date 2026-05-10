import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";
import { badRequest, success, serverError } from "@/lib/response";

async function validateInvitation(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { token } = req.query;
    if (typeof token !== "string") {
      return badRequest(res, "Invalid invitation token");
    }

    // Find invitation by token
    const invitation = await prisma.invitation.findUnique({
      where: { token },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!invitation) {
      return success(res, { valid: false, reason: "Invitation not found" });
    }

    // Check if already used
    if (invitation.isUsed) {
      return success(
        res,
        { valid: false, reason: "Invitation has already been used" }
      );
    }

    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      return success(
        res,
        { valid: false, reason: "Invitation has expired" }
      );
    }

    return success(res, {
      valid: true,
      company: {
        id: invitation.company.id,
        name: invitation.company.name,
        logo: invitation.company.logo,
      },
    });
  } catch (error) {
    console.error("Validate invitation error:", error);
    return serverError(res, "Failed to validate invitation");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return badRequest(res, "Method not allowed");
  }

  return validateInvitation(req, res);
}
