import type { NextApiRequest, NextApiResponse } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://trustfiti.co.ke";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const robotsTxt = `# TrustFiti Robots.txt
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

# Sitemaps
Sitemap: ${BASE_URL}/api/sitemap

# Disallow admin/api/internal routes
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /_next/
Disallow: /dashboard/

User-agent: *
Allow: /
Disallow: /api/admin/
Disallow: /api/auth/
Disallow: /_next/
`;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");
  return res.status(200).send(robotsTxt);
}
