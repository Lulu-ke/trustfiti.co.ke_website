import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { verifyDomainOwnership, getVerificationInstructions } from "@/lib/domainVerify";
import { success, badRequest, serverError, unauthorized, forbidden, notFound } from "@/lib/response";

// POST /api/claim/[id]/verify — Verify a claim request
// GET  /api/claim/[id] — Get claim status and instructions
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return unauthorized(res, "Authentication required");
    }

    const userId = (session.user as any).id;
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return badRequest(res, "Claim ID required");
    }

    const claim = await prisma.claimRequest.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, name: true, slug: true, isClaimed: true, ownerId: true },
        },
      },
    });

    if (!claim) {
      return notFound(res, "Claim request not found");
    }

    // Only allow the claimer or admin to access
    if (claim.claimerId !== userId && (session.user as any).role !== "ADMIN") {
      return forbidden(res, "You do not have access to this claim");
    }

    // Check if expired
    if (claim.status === "PENDING" && new Date() > claim.expiresAt) {
      await prisma.claimRequest.update({
        where: { id },
        data: { status: "EXPIRED" },
      });
      claim.status = "EXPIRED";
    }

    // GET — Return claim status with instructions
    if (req.method === "GET") {
      const instructions = getVerificationInstructions(claim.domain, claim.verificationCode);

      return success(res, {
        id: claim.id,
        company: claim.company,
        method: claim.method,
        domain: claim.domain,
        status: claim.status,
        verificationCode: claim.status === "PENDING" ? claim.verificationCode : null,
        expiresAt: claim.expiresAt,
        createdAt: claim.createdAt,
        verifiedAt: claim.verifiedAt,
        rejectionReason: claim.rejectionReason,
        instructions: instructions[claim.method] || null,
      });
    }

    // POST — Verify domain ownership
    if (req.method === "POST") {
      if (claim.status !== "PENDING") {
        return badRequest(res, `Claim is ${claim.status.toLowerCase()}. Cannot verify.`);
      }

      if (new Date() > claim.expiresAt) {
        return badRequest(res, "Claim has expired. Please submit a new claim request.");
      }

      // Run verification
      const result = await verifyDomainOwnership(
        claim.method as "DNS_TXT" | "META_TAG" | "HTML_FILE",
        claim.domain,
        claim.verificationCode
      );

      if (!result.success) {
        return success(res, {
          verified: false,
          method: claim.method,
          message: result.message,
          details: result.details,
        }, "Verification failed. Please follow the instructions and try again.");
      }

      // Verification passed! Update the claim and company
      const now = new Date();

      await prisma.claimRequest.update({
        where: { id },
        data: {
          status: "VERIFIED",
          verifiedAt: now,
        },
      });

      // Update company: set owner, mark as claimed
      await prisma.company.update({
        where: { id: claim.companyId },
        data: {
          isClaimed: true,
          ownerId: userId,
        },
      });

      // Upgrade user role to COMPANY_OWNER
      await prisma.user.update({
        where: { id: userId },
        data: { role: "COMPANY_OWNER" },
      });

      // Cancel any other pending claims for this company
      await prisma.claimRequest.updateMany({
        where: {
          companyId: claim.companyId,
          status: "PENDING",
          id: { not: id },
        },
        data: { status: "CANCELLED" },
      });

      // Notify the user
      await prisma.notification.create({
        data: {
          userId,
          type: "CLAIM_VERIFIED",
          title: "Business Claim Verified!",
          message: `Congratulations! You are now the verified owner of "${claim.company.name}". You can manage your business from the Company Dashboard.`,
          metadata: {
            claimId: id,
            companyId: claim.companyId,
            companyName: claim.company.name,
          },
        },
      });

      return success(res, {
        verified: true,
        company: claim.company,
        message: "Domain verified! You are now the owner of this business.",
      });
    }

    return badRequest(res, "Method not allowed");
  } catch (error) {
    console.error("Claim verification error:", error);
    return serverError(res, "Failed to process verification");
  }
}
