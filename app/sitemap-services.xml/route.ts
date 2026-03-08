import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contractorsaustin.com";

export async function GET() {
  try {
    const [services, locations] = await Promise.all([
      prisma.service.findMany({ where: { isPublic: true, isActive: true }, select: { slug: true } }),
      prisma.location.findMany({ where: { isActive: true }, select: { slug: true } }),
    ]);

    const urls: string[] = [];

    // Service pages
    services.forEach((s) => {
      urls.push(`<url><loc>${siteUrl}/${s.slug}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    });

    // Service × Location pages
    services.forEach((s) => {
      locations.forEach((l) => {
        urls.push(`<url><loc>${siteUrl}/${l.slug}-${s.slug}</loc><changefreq>daily</changefreq><priority>0.7</priority></url>`);
      });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml" },
    });
  } catch {
    return new NextResponse("Error generating sitemap", { status: 500 });
  }
}
