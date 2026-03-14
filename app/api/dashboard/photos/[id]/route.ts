import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const photo = await prisma.contractorPhoto.findUnique({
      where: { id: params.id },
      include: { contractor: true },
    });

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    // Verify ownership
    if (photo.contractor.userId !== user.id && photo.contractor.email !== user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete from storage
    const adminSupabase = createAdminClient();
    const urlParts = photo.url.split("/contractor-photos/");
    if (urlParts[1]) {
      await adminSupabase.storage
        .from("contractor-photos")
        .remove([urlParts[1]]);
    }

    await prisma.contractorPhoto.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/dashboard/photos/[id] error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
