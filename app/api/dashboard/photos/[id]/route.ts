import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: photo } = await admin
      .from("ContractorPhoto")
      .select("id, url, Contractor(userId, email)")
      .eq("id", params.id)
      .maybeSingle();

    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contractor = Array.isArray((photo as any).Contractor) ? (photo as any).Contractor[0] : (photo as any).Contractor;
    if (contractor?.userId !== user.id && contractor?.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const urlParts = photo.url.split("/contractor-photos/");
    if (urlParts[1]) {
      await admin.storage.from("contractor-photos").remove([urlParts[1]]);
    }

    await admin.from("ContractorPhoto").delete().eq("id", params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dashboard/photos/[id] error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
