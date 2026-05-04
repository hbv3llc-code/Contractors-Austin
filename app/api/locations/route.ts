import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data: locations } = await admin
      .from("Location")
      .select("id, name, slug, isActive")
      .eq("isActive", true)
      .order("name", { ascending: true });
    return NextResponse.json({ success: true, data: locations ?? [] });
  } catch (error) {
    console.error("GET /api/locations error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch locations" } },
      { status: 500 }
    );
  }
}
