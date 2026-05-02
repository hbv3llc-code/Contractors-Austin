import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { ownerName, name, address, city, zip, phone, email, serviceId } = await request.json();

    if (!ownerName || !name || !address || !city || !phone || !email || !serviceId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.contractor.findFirst({
      where: { OR: [{ userId: user.id }, { email: user.email! }] },
    });

    if (existing) {
      // Update existing contractor (e.g. claim flow)
      const contractor = await prisma.contractor.update({
        where: { id: existing.id },
        data: {
          ownerName,
          name,
          address,
          city,
          state: "TX",
          zip,
          phone: phone.replace(/\D/g, ""),
          email,
          userId: user.id,
          services: {
            upsert: {
              where: { contractorId_serviceId: { contractorId: existing.id, serviceId } },
              create: { serviceId, isPrimary: true },
              update: { isPrimary: true },
            },
          },
        },
      });
      return NextResponse.json({ success: true, data: contractor });
    }

    // Create new contractor
    let slug = generateSlug(name);
    const slugExists = await prisma.contractor.findUnique({ where: { slug } });
    if (slugExists) slug = generateSlug(name, Math.random().toString(36).slice(2, 6));

    const contractor = await prisma.contractor.create({
      data: {
        userId: user.id,
        ownerName,
        name,
        slug,
        address,
        city,
        state: "TX",
        zip,
        phone: phone.replace(/\D/g, ""),
        email,
        verifiedStatus: "claimed",
        listingSource: "self_registered",
        membership: { create: { planType: "basic", status: "active" } },
        services: { create: { serviceId, isPrimary: true } },
      },
    });

    return NextResponse.json({ success: true, data: contractor }, { status: 201 });
  } catch (error) {
    console.error("POST /api/onboarding error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
