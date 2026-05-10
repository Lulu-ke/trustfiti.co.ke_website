import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import {
  normalizeDomain,
  generateVerificationCode,
} from "@/lib/domainVerify";
import { badRequest, success, serverError, unauthorized, forbidden } from "@/lib/response";

// POST /api/claim — Submit a new claim request for a company
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return badRequest(res, "Method not allowed");
    }

    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user) {
      return unauthorized(res, "Authentication required");
    }

    const userId = (session.user as any).id;
    const { companyId, domain, method, contactName, contactEmail, contactPhone, additionalInfo } = req.body;

    // Validate required fields
    if (!companyId || !domain || !method || !contactName || !contactEmail || !contactPhone) {
      return badRequest(res, "Missing required fields: companyId, domain, method, contactName, contactEmail, contactPhone");
    }

    if (!["DNS_TXT", "META_TAG", "HTML_FILE"].includes(method)) {
      return badRequest(res, "Invalid verification method. Must be DNS_TXT, META_TAG, or HTML_FILE");
    }

    // Look up the company
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return badRequest(res, "Company not found");
    }

    // Check if already claimed
    if (company.isClaimed && company.ownerId) {
      return forbidden(res, "This company has already been claimed by another owner.");
    }

    // Check if user already has a pending claim for this company
    const existingClaim = await prisma.claimRequest.findFirst({
      where: {
        companyId,
        claimerId: userId,
        status: "PENDING",
      },
    });

    if (existingClaim) {
      return badRequest(res, "You already have a pending claim for this company. Please verify or cancel it first.");
    }

    // Normalize domain
    const normalizedDomain = normalizeDomain(domain);

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create claim request (expires in 7 days)
    const claim = await prisma.claimRequest.create({
      data: {
        verificationCode,
        method,
        domain: normalizedDomain,
        contactName,
        contactEmail,
        contactPhone,
        additionalInfo: additionalInfo || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        companyId,
        claimerId: userId,
      },
    });

    // Create notification for the claimer
    await prisma.notification.create({
      data: {
        userId,
        type: "CLAIM_SUBMITTED",
        title: "Business Claim Submitted",
        message: `Your claim request for "${company.name}" has been submitted. Please complete the domain verification within 7 days.`,
        metadata: {
          claimId: claim.id,
          companyId,
          companyName: company.name,
          verificationCode,
          method,
          domain: normalizedDomain,
        },
      },
    });

    return success(res, {
      claimId: claim.id,
      verificationCode,
      domain: normalizedDomain,
      method,
      expiresAt: claim.expiresAt,
    }, "Claim request submitted. Complete verification within 7 days.");
  } catch (error) {
    console.error("Claim submission error:", error);
    return serverError(res, "Failed to submit claim request");
  }
}
