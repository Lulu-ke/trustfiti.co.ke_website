import dns from "dns/promises";
import axios from "axios";

/**
 * Domain verification utility for TrustFiti business claiming.
 * Supports 3 methods:
 *   1. DNS TXT record: Add a TXT record to domain DNS
 *   2. HTML meta tag: Add a meta tag to website homepage
 *   3. HTML file: Upload a verification file to website root
 */

export interface VerificationCheckResult {
  success: boolean;
  method: string;
  message: string;
  details?: string;
}

/**
 * Normalize a domain: strip protocol, www, trailing slashes
 */
export function normalizeDomain(domain: string): string {
  let d = domain.trim().toLowerCase();
  d = d.replace(/^https?:\/\//, "");
  d = d.replace(/^www\./, "");
  d = d.replace(/\/+$/, "");
  d = d.split("/")[0]; // Remove path
  return d;
}

/**
 * Extract root domain from email address
 */
export function domainFromEmail(email: string): string {
  const parts = email.trim().toLowerCase().split("@");
  return parts.length === 2 ? parts[1] : "";
}

/**
 * Generate a unique verification code
 */
export function generateVerificationCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "trustfiti-";
  for (let i = 0; i < 16; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Verify via DNS TXT record lookup
 * Business must add: trustfiti-verification=CODE as a TXT record on their domain
 */
export async function verifyDnsTxt(domain: string, code: string): Promise<VerificationCheckResult> {
  try {
    const normalized = normalizeDomain(domain);
    const records = await dns.resolveTxt(normalized);

    // dns.resolveTxt returns array of arrays - flatten and search
    const allRecords = records.flat();

    for (const record of allRecords) {
      // Check for format: trustfiti-verification=CODE
      if (record.includes("trustfiti-verification=")) {
        const match = record.match(/trustfiti-verification=([^\s;]+)/);
        if (match && match[1] === code) {
          return {
            success: true,
            method: "DNS_TXT",
            message: "DNS TXT record verified successfully.",
            details: `Found trustfiti-verification=${code} on ${normalized}`,
          };
        }
      }
    }

    return {
      success: false,
      method: "DNS_TXT",
      message: "TXT record not found or code mismatch.",
      details: `Add a TXT record: trustfiti-verification=${code} on ${normalized}`,
    };
  } catch (error: any) {
    if (error.code === "ENOTFOUND" || error.code === "ENODATA") {
      return {
        success: false,
        method: "DNS_TXT",
        message: "No TXT records found for this domain.",
        details: `Add a TXT record: trustfiti-verification=${code} on ${normalizeDomain(domain)}`,
      };
    }
    return {
      success: false,
      method: "DNS_TXT",
      message: "DNS lookup failed.",
      details: error.message,
    };
  }
}

/**
 * Verify via HTML meta tag on website homepage
 * Business must add: <meta name="trustfiti-verification" content="CODE" />
 */
export async function verifyMetaTag(domain: string, code: string): Promise<VerificationCheckResult> {
  try {
    const normalized = normalizeDomain(domain);
    const url = `https://${normalized}`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "TrustFiti-Verification-Bot/1.0",
      },
      validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
      return {
        success: false,
        method: "META_TAG",
        message: `Website returned status ${response.status}.`,
        details: `Could not fetch ${url}`,
      };
    }

    const html = response.data as string;
    const metaRegex = /<meta\s+[^>]*name=["']trustfiti-verification["'][^>]*content=["']([^"']+)["'][^>]*\/?>/i;
    const metaRegexAlt = /<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']trustfiti-verification["'][^>]*\/?>/i;

    const match = html.match(metaRegex) || html.match(metaRegexAlt);

    if (match && match[1] === code) {
      return {
        success: true,
        method: "META_TAG",
        message: "Meta tag verified successfully.",
        details: `Found trustfiti-verification meta tag on ${url}`,
      };
    }

    return {
      success: false,
      method: "META_TAG",
      message: "Meta tag not found or code mismatch.",
      details: `Add to your homepage: <meta name="trustfiti-verification" content="${code}" />`,
    };
  } catch (error: any) {
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      return {
        success: false,
        method: "META_TAG",
        message: "Could not connect to the website.",
        details: `Make sure https://${normalizeDomain(domain)} is accessible`,
      };
    }
    return {
      success: false,
      method: "META_TAG",
      message: "Verification failed.",
      details: error.message,
    };
  }
}

/**
 * Verify via HTML file upload
 * Business must upload: trustfiti-verification-CODE.html containing the code
 */
export async function verifyHtmlFile(domain: string, code: string): Promise<VerificationCheckResult> {
  try {
    const normalized = normalizeDomain(domain);
    const url = `https://${normalized}/trustfiti-verification-${code}.html`;
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent": "TrustFiti-Verification-Bot/1.0",
      },
      validateStatus: (status) => status < 500,
    });

    if (response.status !== 200) {
      return {
        success: false,
        method: "HTML_FILE",
        message: `File returned status ${response.status}.`,
        details: `Upload trustfiti-verification-${code}.html to your website root`,
      };
    }

    const content = (response.data as string).trim();
    if (content === code || content.includes(code)) {
      return {
        success: true,
        method: "HTML_FILE",
        message: "HTML file verified successfully.",
        details: `Found trustfiti-verification-${code}.html on ${normalized}`,
      };
    }

    return {
      success: false,
      method: "HTML_FILE",
      message: "File content does not match verification code.",
      details: `The file should contain only: ${code}`,
    };
  } catch (error: any) {
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND" || error.response?.status === 404) {
      return {
        success: false,
        method: "HTML_FILE",
        message: "Verification file not found.",
        details: `Upload trustfiti-verification-${code}.html containing "${code}" to your website root`,
      };
    }
    return {
      success: false,
      method: "HTML_FILE",
      message: "Verification failed.",
      details: error.message,
    };
  }
}

/**
 * Main verification dispatcher — runs the appropriate check based on method
 */
export async function verifyDomainOwnership(
  method: "DNS_TXT" | "META_TAG" | "HTML_FILE",
  domain: string,
  code: string
): Promise<VerificationCheckResult> {
  switch (method) {
    case "DNS_TXT":
      return verifyDnsTxt(domain, code);
    case "META_TAG":
      return verifyMetaTag(domain, code);
    case "HTML_FILE":
      return verifyHtmlFile(domain, code);
    default:
      return {
        success: false,
        method,
        message: "Unknown verification method.",
      };
  }
}

/**
 * Get instructions for each verification method
 */
export function getVerificationInstructions(domain: string, code: string): Record<string, { title: string; steps: string[] }> {
  const normalized = normalizeDomain(domain);
  return {
    DNS_TXT: {
      title: "DNS TXT Record",
      steps: [
        "Log in to your domain registrar or DNS provider (e.g., Cloudflare, GoDaddy, Namecheap).",
        `Navigate to DNS management for ${normalized}.`,
        "Add a new TXT record with the following details:",
        `   Host/Name: @ or ${normalized}`,
        `   Type: TXT`,
        `   Value: trustfiti-verification=${code}`,
        "Save the record. DNS propagation may take a few minutes to 48 hours.",
        "Click 'Verify' below once the record is saved.",
      ],
    },
    META_TAG: {
      title: "HTML Meta Tag",
      steps: [
        "Log in to your website's content management system or hosting.",
        `Add the following meta tag to the <head> section of your homepage (${normalized}):`,
        `   <meta name="trustfiti-verification" content="${code}" />`,
        "Save and publish the changes.",
        "Click 'Verify' below once the page is live.",
      ],
    },
    HTML_FILE: {
      title: "HTML File Upload",
      steps: [
        "Create a new file with the following name:",
        `   trustfiti-verification-${code}.html`,
        "Add only the following content to the file:",
        `   ${code}`,
        "Upload the file to the root directory of your website.",
        "The file should be accessible at:",
        `   https://${normalized}/trustfiti-verification-${code}.html`,
        "Click 'Verify' below once the file is uploaded.",
      ],
    },
  };
}
