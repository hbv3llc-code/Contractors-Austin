"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
}

interface PhotoUploadProps {
  contractorId: string;
  initialPhotos: Photo[];
  planType: string;
}

export function PhotoUpload({ contractorId, initialPhotos, planType }: PhotoUploadProps) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const maxPhotos = planType === "premium" ? 20 : planType === "featured" ? 10 : 3;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", caption);

      const res = await fetch("/api/dashboard/photos", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok) {
        toast({ variant: "destructive", title: "Upload failed", description: json.error });
        return;
      }

      setPhotos((prev) => [...prev, json.data]);
      setCaption("");
      toast({ title: "Photo uploaded!" });
    } catch {
      toast({ variant: "destructive", title: "Upload failed", description: "Please try again." });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(photoId: string) {
    try {
      const res = await fetch(`/api/dashboard/photos/${photoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setPhotos((prev) => prev.filter((p) => p.id !== photoId));
      toast({ title: "Photo removed." });
    } catch {
      toast({ variant: "destructive", title: "Failed to remove photo." });
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Project Photos</h2>
        <span className="text-sm text-muted-foreground">{photos.length} / {maxPhotos}</span>
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
              <Image
                src={photo.url}
                alt={photo.caption ?? "Project photo"}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
              {photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                  <p className="text-xs text-white truncate">{photo.caption}</p>
                </div>
              )}
              <button
                onClick={() => handleDelete(photo.id)}
                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {photos.length < maxPhotos ? (
        <div className="space-y-3">
          <Input
            placeholder="Caption (optional)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="max-w-sm"
          />
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><ImagePlus className="h-4 w-4" /> Add Photo</>
              )}
            </Button>
            <p className="text-xs text-muted-foreground mt-1.5">JPG, PNG, WebP · Max 5MB</p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Photo limit reached for your plan.{" "}
          {planType !== "premium" && (
            <a href="/pricing" className="text-primary hover:underline">Upgrade for more →</a>
          )}
        </p>
      )}
    </div>
  );
}
