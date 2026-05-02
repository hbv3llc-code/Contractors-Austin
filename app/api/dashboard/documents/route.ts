import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type DocType = "license" | "insurance";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("Contractor")
      .select("id")
      .or(`userId.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!contractor) return NextResponse.json({ error: "Contractor not found" }, { status: 404 });

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("type") as DocType;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!["license", "insurance"].includes(docType)) return NextResponse.json({ error: "Invalid document type" }, { status: 400 });

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) return NextResponse.json({ error: "File must be an image or PDF" }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File must be under 10MB" }, { status: 400 });

    const ext = file.name.split(".").pop() ?? "pdf";
    const filename = `${contractor.id}/${docType}-${Date.now()}.${ext}`;

    const { error: uploadError } = await admin.storage
      .from("contractor-documents")
      .upload(filename, file, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: { publicUrl } } = admin.storage.from("contractor-documents").getPublicUrl(filename);

    const updateData = docType === "license"
      ? { licenseFileUrl: publicUrl }
      : { insuranceFileUrl: publicUrl };

    await admin.from("Contractor").update(updateData).eq("id", contractor.id);

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error) {
    console.error("POST /api/dashboard/documents error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
