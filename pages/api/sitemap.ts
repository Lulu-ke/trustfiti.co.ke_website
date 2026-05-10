import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://trustfiti.co.ke";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Fetch all active companies
    const companies = await prisma.company.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changeFreq: "daily" },
      { url: "/companies", priority: "0.9", changeFreq: "daily" },
      { url: "/login", priority: "0.5", changeFreq: "monthly" },
      { url: "/reviews/write", priority: "0.7", changeFreq: "monthly" },
      { url: "/profile", priority: "0.4", changeFreq: "weekly" },
    ];

    // Build XML sitemap
    const urls = [
      ...staticPages.map((page) => ({
        loc: `${BASE_URL}${page.url}`,
        lastmod: new Date().toISOString().split("T")[0],
        changefreq: page.changeFreq,
        priority: page.priority,
      })),
      ...companies.map((company) => ({
        loc: `${BASE_URL}/companies/${company.slug}`,
        lastmod: company.updatedAt ? company.updatedAt.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        changefreq: "weekly" as const,
        priority: "0.8",
      })),
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=43200");
    return res.status(200).send(sitemap);
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return res.status(500).json({ error: "Failed to generate sitemap" });
  }
}
