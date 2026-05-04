import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://contractorsaustin.com";

export async function GET() {
  try {
    const admin = createAdminClient();
    const [{ data: services }, { data: locations }] = await Promise.all([
      admin.from("Service").select("slug").eq("isPublic", true).eq("isActive", true),
      admin.from("Location").select("slug").eq("isActive", true),
    ]);

    const urls: string[] = [];

    (services ?? []).forEach((s: { slug: string }) => {
      urls.push(`<url><loc>${siteUrl}/${s.slug}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`);
    });

    (services ?? []).forEach((s: { slug: string }) => {
      (locations ?? []).forEach((l: { slug: string }) => {
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
