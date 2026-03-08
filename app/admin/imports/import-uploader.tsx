"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImportResult {
  batchId: string;
  totalRows: number;
  successfulRows: number;
  skippedRows: number;
  errorRows: number;
  errors: string[];
}

export default function ImportUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.name.endsWith(".csv")) {
      setFile(f);
      setResult(null);
      setError(null);
    } else {
      setError("Please select a CSV file");
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/imports", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }

      setResult(data.data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-4">
      <h2 className="font-bold text-foreground">Upload CSV</h2>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">Import complete</span>
          </div>
          <div className="grid grid-cols-4 gap-3 text-center text-sm">
            <div><p className="font-bold text-foreground">{result.totalRows}</p><p className="text-xs text-muted-foreground">Total</p></div>
            <div><p className="font-bold text-green-600">{result.successfulRows}</p><p className="text-xs text-muted-foreground">Imported</p></div>
            <div><p className="font-bold text-yellow-600">{result.skippedRows}</p><p className="text-xs text-muted-foreground">Skipped</p></div>
            <div><p className="font-bold text-red-600">{result.errorRows}</p><p className="text-xs text-muted-foreground">Errors</p></div>
          </div>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-red-600 mb-1">Error details:</p>
              <ul className="text-xs text-red-600 space-y-0.5">
                {result.errors.slice(0, 5).map((e, i) => <li key={i}>• {e}</li>)}
                {result.errors.length > 5 && <li>... and {result.errors.length - 5} more</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-8 cursor-pointer transition-colors"
      >
        <Upload className="h-8 w-8 text-gray-400 mb-2" />
        {file ? (
          <p className="text-sm font-medium text-foreground">{file.name}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-foreground">Click to select a CSV file</p>
            <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <Button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="w-full"
      >
        {uploading ? "Processing..." : "Import CSV"}
      </Button>
    </div>
  );
}
