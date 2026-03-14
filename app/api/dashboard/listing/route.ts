import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, website, address, city, zip, yearsInBusiness, licenseNumber, description, email } = body;

    if (!name || !city) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name and city are required" } },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(name);
    const existing = await prisma.contractor.findUnique({ where: { slug } });
    if (existing) {
      slug = generateSlug(name, Math.random().toString(36).slice(2, 6));
    }

    const contractor = await prisma.contractor.create({
      data: {
        userId: user.id,
        name,
        slug,
        phone: phone?.replace(/\D/g, ""),
        website: website ? (website.startsWith("http") ? website : `https://${website}`) : null,
        address,
        city,
        state: "TX",
        zip,
        yearsInBusiness: yearsInBusiness ?? undefined,
        licenseNumber,
        description,
        email: email ?? user.email,
        verifiedStatus: "claimed",
        listingSource: "self_registered",
        membership: {
          create: { planType: "basic", status: "active" },
        },
      },
    });

    return NextResponse.json({ success: true, data: contractor }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dashboard/listing error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create listing" } },
      { status: 500 }
    );
  }
}
