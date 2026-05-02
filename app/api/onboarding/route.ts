import { NextRequest, NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
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

    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check for existing contractor
    const { data: existing } = await admin
      .from("Contractor")
      .select("id")
      .or(`userId.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    const cleanPhone = phone.replace(/\D/g, "");

    if (existing) {
      const { data: contractor, error } = await admin
        .from("Contractor")
        .update({
          ownerName,
          name,
          address,
          city,
          state: "TX",
          zip: zip ?? null,
          phone: cleanPhone,
          email,
          userId: user.id,
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) throw error;

      // Upsert primary service
      await admin
        .from("ContractorService")
        .upsert(
          { contractorId: existing.id, serviceId, isPrimary: true },
          { onConflict: "contractorId,serviceId" }
        );

      return NextResponse.json({ success: true, data: contractor });
    }

    // Generate unique slug
    let slug = generateSlug(name);
    const { data: slugCheck } = await admin
      .from("Contractor")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (slugCheck) slug = generateSlug(name, Math.random().toString(36).slice(2, 6));

    // Create new contractor
    const { data: contractor, error: createError } = await admin
      .from("Contractor")
      .insert({
        userId: user.id,
        ownerName,
        name,
        slug,
        address,
        city,
        state: "TX",
        zip: zip ?? null,
        phone: cleanPhone,
        email,
        verifiedStatus: "claimed",
        listingSource: "self_registered",
      })
      .select()
      .single();

    if (createError) throw createError;

    // Create service and membership
    await Promise.all([
      admin.from("ContractorService").insert({ contractorId: contractor.id, serviceId, isPrimary: true }),
      admin.from("Membership").insert({ contractorId: contractor.id, planType: "basic", status: "active" }),
    ]);

    return NextResponse.json({ success: true, data: contractor }, { status: 201 });
  } catch (error) {
    console.error("POST /api/onboarding error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
