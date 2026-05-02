import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });

    const body = await request.json();
    const { name, phone, website, address, city, zip, yearsInBusiness, licenseNumber, description, email } = body;

    if (!name || !city) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Name and city are required" } },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    let slug = generateSlug(name);
    const { data: existing } = await admin.from("Contractor").select("id").eq("slug", slug).maybeSingle();
    if (existing) slug = generateSlug(name, Math.random().toString(36).slice(2, 6));

    const { data: contractor, error } = await admin
      .from("Contractor")
      .insert({
        userId: user.id,
        name,
        slug,
        phone: phone?.replace(/\D/g, "") ?? null,
        website: website ? (website.startsWith("http") ? website : `https://${website}`) : null,
        address: address ?? null,
        city,
        state: "TX",
        zip: zip ?? null,
        yearsInBusiness: yearsInBusiness ?? null,
        licenseNumber: licenseNumber ?? null,
        description: description ?? null,
        email: email ?? user.email,
        verifiedStatus: "claimed",
        listingSource: "self_registered",
      })
      .select()
      .single();

    if (error) throw error;

    await admin.from("Membership").insert({ contractorId: contractor.id, planType: "basic", status: "active" });

    return NextResponse.json({ success: true, data: contractor }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dashboard/listing error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create listing" } },
      { status: 500 }
    );
  }
}
