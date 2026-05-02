"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  ownerName: z.string().min(2, "Owner name is required"),
  name: z.string().min(2, "Business name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  serviceId: z.string().min(1, "Please select a category"),
});

type FormData = z.infer<typeof schema>;

interface Props {
  contractor: {
    id: string;
    ownerName: string | null;
    name: string;
    address: string | null;
    city: string | null;
    zip: string | null;
    phone: string | null;
    email: string | null;
    services: { service: { id: string; name: string }; isPrimary: boolean }[];
  } | null;
  userEmail: string;
  services: { id: string; name: string }[];
}

export default function OnboardingForm({ contractor, userEmail }: Omit<Props, "services">) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data)) {
          setServices(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const primaryService = contractor?.services.find((s) => s.isPrimary)?.service;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ownerName: contractor?.ownerName ?? "",
      name: contractor?.name ?? "",
      address: contractor?.address ?? "",
      city: contractor?.city ?? "Austin",
      zip: contractor?.zip ?? "",
      phone: contractor?.phone ?? "",
      email: contractor?.email ?? userEmail,
      serviceId: primaryService?.id ?? "",
    },
  });

  async function onSubmit(data: FormData) {
    setError(null);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save");
      router.push("/dashboard?welcome=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 bg-white rounded-2xl border border-border p-8 shadow-sm">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="ownerName">Your Name (Owner / Admin) *</Label>
          <Input id="ownerName" {...register("ownerName")} placeholder="Jane Smith" className="mt-1" />
          {errors.ownerName && <p className="text-xs text-red-600 mt-1">{errors.ownerName.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="name">Business Name *</Label>
          <Input id="name" {...register("name")} placeholder="Smith Plumbing LLC" className="mt-1" />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="serviceId">Business Category *</Label>
          <select
            id="serviceId"
            {...register("serviceId")}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select a category…</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.serviceId && <p className="text-xs text-red-600 mt-1">{errors.serviceId.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="address">Street Address *</Label>
          <Input id="address" {...register("address")} placeholder="123 Main St" className="mt-1" />
          {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
        </div>

        <div>
          <Label htmlFor="city">City *</Label>
          <Input id="city" {...register("city")} placeholder="Austin" className="mt-1" />
          {errors.city && <p className="text-xs text-red-600 mt-1">{errors.city.message}</p>}
        </div>

        <div>
          <Label htmlFor="zip">ZIP Code *</Label>
          <Input id="zip" {...register("zip")} placeholder="78701" maxLength={5} className="mt-1" />
          {errors.zip && <p className="text-xs text-red-600 mt-1">{errors.zip.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input id="phone" {...register("phone")} placeholder="(512) 555-0100" className="mt-1" />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">Business Email *</Label>
          <Input id="email" type="email" {...register("email")} placeholder="you@company.com" className="mt-1" />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Complete Setup →"}
      </Button>
    </form>
  );
}
