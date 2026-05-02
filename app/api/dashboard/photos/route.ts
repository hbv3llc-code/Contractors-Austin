import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("Contractor")
      .select("id, Membership(planType), ContractorPhoto(id)")
      .or(`userId.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = Array.isArray((contractor as any).Membership) ? (contractor as any).Membership[0] : (contractor as any).Membership;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const photoCount = ((contractor as any).ContractorPhoto ?? []).length;

    const maxPhotos = membership?.planType === "premium" ? 20
      : membership?.planType === "featured" ? 10
      : 3;

    if (photoCount >= maxPhotos) {
      return NextResponse.json({ error: `Your plan allows up to ${maxPhotos} photos` }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) ?? "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });

    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `${contractor.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("contractor-photos")
      .upload(filename, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from("contractor-photos").getPublicUrl(filename);

    const { data: photo, error: insertError } = await admin
      .from("ContractorPhoto")
      .insert({ contractorId: contractor.id, url: publicUrl, caption: caption || null, sortOrder: photoCount })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, data: photo }, { status: 201 });
  } catch (error) {
    console.error("POST /api/dashboard/photos error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
