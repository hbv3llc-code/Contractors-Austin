import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    return headers.reduce<Record<string, string>>((acc, h, i) => {
      acc[h] = values[i] ?? "";
      return acc;
    }, {});
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const text = await file.text();
    const rows = parseCSV(text);

    if (rows.length === 0) {
      return NextResponse.json({ error: "CSV is empty or malformed" }, { status: 400 });
    }

    const admin = createAdminClient();

    const { data: batch } = await admin
      .from("ImportBatch")
      .insert({
        filename: file.name,
        importedByAdmin: user.email ?? user.id,
        totalRows: rows.length,
        status: "processing",
      })
      .select()
      .single();

    if (!batch) {
      return NextResponse.json({ error: "Failed to create import batch" }, { status: 500 });
    }

    let successfulRows = 0;
    let skippedRows = 0;
    let errorRows = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row.businessName?.trim()) {
        skippedRows++;
        continue;
      }

      try {
        if (row.googlePlaceId) {
          const { data: existing } = await admin
            .from("ImportedListing")
            .select("id")
            .eq("googlePlaceId", row.googlePlaceId)
            .maybeSingle();
          if (existing) {
            skippedRows++;
            continue;
          }
        }

        const { error } = await admin.from("ImportedListing").insert({
          importBatchId: batch.id,
          googlePlaceId: row.googlePlaceId || null,
          businessName: row.businessName.trim(),
          phone: row.phone || null,
          email: row.email || null,
          website: row.website || null,
          address: row.address || null,
          city: row.city || null,
          state: row.state || "TX",
          zip: row.zip || null,
          lat: row.lat ? parseFloat(row.lat) : null,
          lng: row.lng ? parseFloat(row.lng) : null,
          categoriesRaw: row.categoriesRaw || null,
          description: row.description || null,
          status: "unclaimed",
        });

        if (error) throw new Error(error.message);
        successfulRows++;
      } catch (err) {
        errorRows++;
        errors.push(`Row ${i + 2}: ${(err as Error).message}`);
      }
    }

    await admin
      .from("ImportBatch")
      .update({ successfulRows, skippedRows, errorRows, status: "complete" })
      .eq("id", batch.id);

    return NextResponse.json({
      success: true,
      data: { batchId: batch.id, totalRows: rows.length, successfulRows, skippedRows, errorRows, errors },
    });
  } catch (error) {
    console.error("POST /api/admin/imports error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
