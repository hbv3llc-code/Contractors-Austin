export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import ImportUploader from "./import-uploader";

export const metadata: Metadata = { title: "Import Listings | Admin" };

async function getBatches() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("ImportBatch")
      .select("id, filename, totalRows, successfulRows, skippedRows, errorRows, status, createdAt")
      .order("createdAt", { ascending: false })
      .limit(20);
    return data ?? [];
  } catch { return []; }
}

async function getUnclaimedCount() {
  try {
    const admin = createAdminClient();
    const { count } = await admin
      .from("ImportedListing")
      .select("*", { count: "exact", head: true })
      .eq("status", "unclaimed");
    return count ?? 0;
  } catch { return 0; }
}

export default async function AdminImportsPage() {
  const [batches, unclaimedCount] = await Promise.all([getBatches(), getUnclaimedCount()]);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Import Listings</h1>
        <p className="text-muted-foreground mt-1">
          Upload a CSV to bulk-import contractor listings. Currently{" "}
          <strong>{unclaimedCount.toLocaleString()}</strong> unclaimed listings in the directory.
        </p>
      </div>

      {/* Uploader */}
      <ImportUploader />

      {/* CSV format reference */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="font-bold text-foreground mb-3">Required CSV Format</h2>
        <div className="overflow-x-auto">
          <code className="text-xs block bg-gray-50 rounded-lg p-4 whitespace-pre text-gray-700">
{`businessName,phone,email,website,address,city,state,zip,lat,lng,categoriesRaw,description
"Austin Painters LLC","(512) 555-0100","info@austinpainters.com","https://austinpainters.com","123 Main St","Austin","TX","78701","30.267","−97.743","Painters,Interior Painting","Professional painting services"`}
          </code>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Only <code>businessName</code> is required. All other fields are optional.
        </p>
      </div>

      {/* Import history */}
      {batches.length > 0 && (
        <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-bold text-foreground">Import History</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="px-4 py-3 text-left font-semibold">File</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
                <th className="px-4 py-3 text-right font-semibold">Success</th>
                <th className="px-4 py-3 text-right font-semibold">Skipped</th>
                <th className="px-4 py-3 text-right font-semibold">Errors</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {batches.map((batch: any) => (
                <tr key={batch.id}>
                  <td className="px-4 py-3 font-medium truncate max-w-[180px]">{batch.filename}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{batch.totalRows}</td>
                  <td className="px-4 py-3 text-right text-green-600">{batch.successfulRows}</td>
                  <td className="px-4 py-3 text-right text-yellow-600">{batch.skippedRows}</td>
                  <td className="px-4 py-3 text-right text-red-600">{batch.errorRows}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      batch.status === "complete" ? "text-green-600" :
                      batch.status === "processing" ? "text-blue-600" :
                      "text-gray-500"
                    }`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
