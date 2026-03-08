"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Save, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  name: z.string().min(2, "Business name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().min(1, "City is required"),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
  yearsInBusiness: z.number().min(0).max(100).optional(),
  licenseNumber: z.string().optional(),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ListingSetupFormProps {
  contractor: {
    id: string;
    name: string;
    phone: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    zip: string | null;
    yearsInBusiness: number | null;
    licenseNumber: string | null;
    description: string | null;
  } | null;
  userEmail: string;
}

export function ListingSetupForm({ contractor, userEmail }: ListingSetupFormProps) {
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: contractor?.name ?? "",
      phone: contractor?.phone ?? "",
      website: contractor?.website ?? "",
      address: contractor?.address ?? "",
      city: contractor?.city ?? "Austin",
      zip: contractor?.zip ?? "",
      yearsInBusiness: contractor?.yearsInBusiness ?? undefined,
      licenseNumber: contractor?.licenseNumber ?? "",
      description: contractor?.description ?? "",
    },
  });

  async function onSubmit(data: FormData) {
    try {
      const endpoint = contractor ? `/api/dashboard/listing/${contractor.id}` : "/api/dashboard/listing";
      const method = contractor ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, email: userEmail }),
      });

      if (!res.ok) throw new Error("Failed to save listing");

      setSaved(true);
      toast({ variant: "success" as const, title: "Listing saved!", description: "Your profile has been updated." });
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to save. Please try again." });
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Details */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-5">Contact Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Business Name *</Label>
            <Input id="name" {...register("name")} placeholder="Austin Precision Painting" className="mt-1" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input id="phone" type="tel" {...register("phone")} placeholder="(512) 555-0100" className="mt-1" />
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <Label htmlFor="website">Website URL</Label>
            <Input id="website" {...register("website")} placeholder="https://yoursite.com" className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="address">Street Address</Label>
            <Input id="address" {...register("address")} placeholder="1234 S Lamar Blvd" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register("city")} placeholder="Austin" className="mt-1" />
            {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <Label htmlFor="zip">ZIP Code *</Label>
            <Input id="zip" {...register("zip")} placeholder="78704" maxLength={5} className="mt-1" />
            {errors.zip && <p className="text-xs text-red-500 mt-1">{errors.zip.message}</p>}
          </div>
          <div>
            <Label htmlFor="yearsInBusiness">Years in Business</Label>
            <Input id="yearsInBusiness" type="number" min={0} max={100}
              {...register("yearsInBusiness", { valueAsNumber: true })}
              placeholder="10" className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input id="licenseNumber" {...register("licenseNumber")} placeholder="TX-12345" className="mt-1" />
          </div>
        </div>
      </div>

      {/* About */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-foreground mb-5">About Your Business</h2>
        <div>
          <Label htmlFor="description">Business Description</Label>
          <Textarea
            id="description"
            {...register("description")}
            rows={6}
            placeholder="Tell homeowners about your business, what makes you different, your experience, and the services you offer..."
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            A detailed, professional description improves your ranking and converts more visitors.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
          {saved ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save & Update Listing"}
            </>
          )}
        </Button>
        {contractor && (
          <a
            href={`/contractor/${contractor.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            View public profile →
          </a>
        )}
      </div>
    </form>
  );
}
