import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ success: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });

    const body = await request.json();
    const { name, phone, website, address, city, zip, yearsInBusiness, licenseNumber, description } = body;

    const admin = createAdminClient();

    const { data: existing } = await admin
      .from("Contractor")
      .select("id")
      .eq("id", params.id)
      .or(`userId.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not authorized" } },
        { status: 403 }
      );
    }

    const fields = [name, phone, website, address, city, zip, description];
    const filled = fields.filter(Boolean).length;
    const profileCompleteness = Math.round((filled / fields.length) * 100);

    const { data: contractor, error } = await admin
      .from("Contractor")
      .update({
        name,
        phone: phone?.replace(/\D/g, "") ?? null,
        website: website ? (website.startsWith("http") ? website : `https://${website}`) : null,
        address: address ?? null,
        city,
        state: "TX",
        zip: zip ?? null,
        yearsInBusiness: yearsInBusiness ?? null,
        licenseNumber: licenseNumber ?? null,
        description: description ?? null,
        profileCompleteness,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: contractor });
  } catch (error) {
    console.error("PUT /api/dashboard/listing/[id] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update listing" } },
      { status: 500 }
    );
  }
}
