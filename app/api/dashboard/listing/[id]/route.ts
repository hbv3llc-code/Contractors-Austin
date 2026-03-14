import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, website, address, city, zip, yearsInBusiness, licenseNumber, description } = body;

    // Verify ownership (prefer userId, fall back to email for legacy records)
    const existing = await prisma.contractor.findFirst({
      where: {
        id: params.id,
        OR: [{ userId: user.id }, { email: user.email! }],
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not authorized" } },
        { status: 403 }
      );
    }

    // Calculate completeness
    const fields = [name, phone, website, address, city, zip, description];
    const filled = fields.filter(Boolean).length;
    const profileCompleteness = Math.round((filled / fields.length) * 100);

    const contractor = await prisma.contractor.update({
      where: { id: params.id },
      data: {
        name,
        phone: phone?.replace(/\D/g, ""),
        website: website ? (website.startsWith("http") ? website : `https://${website}`) : null,
        address,
        city,
        state: "TX",
        zip,
        yearsInBusiness: yearsInBusiness ?? undefined,
        licenseNumber,
        description,
        profileCompleteness,
      },
    });

    return NextResponse.json({ success: true, data: contractor });
  } catch (error) {
    console.error("PUT /api/dashboard/listing/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update listing" } },
      { status: 500 }
    );
  }
}
