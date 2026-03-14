"use client";

import { useState, useRef } from "react";
import { ShieldCheck, FileText, Upload, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface DocumentUploadProps {
  licenseFileUrl: string | null;
  insuranceFileUrl: string | null;
  insuranceVerified: boolean;
}

export function DocumentUpload({ licenseFileUrl, insuranceFileUrl, insuranceVerified }: DocumentUploadProps) {
  const [licenseUrl, setLicenseUrl] = useState(licenseFileUrl);
  const [insuranceUrl, setInsuranceUrl] = useState(insuranceFileUrl);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingInsurance, setUploadingInsurance] = useState(false);
  const licenseRef = useRef<HTMLInputElement>(null);
  const insuranceRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  async function handleUpload(file: File, type: "license" | "insurance") {
    const setUploading = type === "license" ? setUploadingLicense : setUploadingInsurance;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const res = await fetch("/api/dashboard/documents", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        toast({ variant: "destructive", title: "Upload failed", description: json.error });
        return;
      }

      if (type === "license") setLicenseUrl(json.url);
      else setInsuranceUrl(json.url);

      toast({ title: "Document uploaded!", description: "An admin will review and verify your document shortly." });
    } catch {
      toast({ variant: "destructive", title: "Upload failed", description: "Please try again." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-bold text-foreground">Verification Documents</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        Upload your license and insurance to earn the verified badge. An admin will review within 2 business days.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* License */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm text-foreground">Contractor License</span>
          </div>
          {licenseUrl ? (
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <a href={licenseUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1">
                View uploaded file <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">No license uploaded yet</p>
          )}
          <input
            ref={licenseRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "license"); }}
            disabled={uploadingLicense}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 w-full"
            onClick={() => licenseRef.current?.click()}
            disabled={uploadingLicense}
          >
            {uploadingLicense ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-3.5 w-3.5" /> {licenseUrl ? "Replace" : "Upload"}</>
            )}
          </Button>
        </div>

        {/* Insurance */}
        <div className="rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm text-foreground">Insurance Certificate</span>
            {insuranceVerified && (
              <span className="ml-auto text-xs text-green-600 font-medium">Verified ✓</span>
            )}
          </div>
          {insuranceUrl ? (
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              <a href={insuranceUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1">
                View uploaded file <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground mb-3">No insurance document uploaded yet</p>
          )}
          <input
            ref={insuranceRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, "insurance"); }}
            disabled={uploadingInsurance}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5 w-full"
            onClick={() => insuranceRef.current?.click()}
            disabled={uploadingInsurance}
          >
            {uploadingInsurance ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="h-3.5 w-3.5" /> {insuranceUrl ? "Replace" : "Upload"}</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
