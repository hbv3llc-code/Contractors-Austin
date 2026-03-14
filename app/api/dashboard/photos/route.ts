import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contractor = await prisma.contractor.findFirst({
      where: { OR: [{ userId: user.id }, { email: user.email! }] },
      include: { membership: true, photos: true },
    });

    if (!contractor) {
      return NextResponse.json({ error: "Contractor not found" }, { status: 404 });
    }

    // Limit photos based on plan
    const maxPhotos = contractor.membership?.planType === "premium" ? 20
      : contractor.membership?.planType === "featured" ? 10
      : 3;

    if (contractor.photos.length >= maxPhotos) {
      return NextResponse.json(
        { error: `Your plan allows up to ${maxPhotos} photos` },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) ?? "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${contractor.id}/${Date.now()}.${ext}`;

    const adminSupabase = createAdminClient();
    const { error: uploadError } = await adminSupabase.storage
      .from("contractor-photos")
      .upload(filename, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = adminSupabase.storage
      .from("contractor-photos")
      .getPublicUrl(filename);

    const photo = await prisma.contractorPhoto.create({
      data: {
        contractorId: contractor.id,
        url: publicUrl,
        caption: caption || null,
        sortOrder: contractor.photos.length,
      },
    });

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dashboard/photos error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
