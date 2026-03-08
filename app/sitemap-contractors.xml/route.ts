import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contractorsaustin.com";

export async function GET() {
  try {
    const contractors = await prisma.contractor.findMany({
      select: { slug: true, updatedAt: true },
    });

    const urls = contractors.map(
      (c) =>
        `<url><loc>${siteUrl}/contractor/${c.slug}</loc><lastmod>${c.updatedAt.toISOString().split("T")[0]}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`
    );

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
