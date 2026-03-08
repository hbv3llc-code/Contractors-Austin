import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

const REQUIRED_COLS = ["businessName"] as const;

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).map((line) => {
    // Simple CSV parser (handles quoted fields with commas)
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

    // Create import batch
    const batch = await prisma.importBatch.create({
      data: {
        filename: file.name,
        importedByAdmin: user.email ?? user.id,
        totalRows: rows.length,
        status: "processing",
      },
    });

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
        // Skip if Google Place ID already exists
        if (row.googlePlaceId) {
          const existing = await prisma.importedListing.findFirst({
            where: { googlePlaceId: row.googlePlaceId },
          });
          if (existing) {
            skippedRows++;
            continue;
          }
        }

        await prisma.importedListing.create({
          data: {
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
          },
        });
        successfulRows++;
      } catch (err) {
        errorRows++;
        errors.push(`Row ${i + 2}: ${(err as Error).message}`);
      }
    }

    // Update batch with results
    await prisma.importBatch.update({
      where: { id: batch.id },
      data: { successfulRows, skippedRows, errorRows, status: "complete" },
    });

    return NextResponse.json({
      success: true,
      data: { batchId: batch.id, totalRows: rows.length, successfulRows, skippedRows, errorRows, errors },
    });
  } catch (error) {
    console.error("POST /api/admin/imports error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
