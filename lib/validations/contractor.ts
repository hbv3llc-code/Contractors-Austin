import { z } from "zod";

export const contactDetailsSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .transform((v) => v.replace(/\D/g, ""))
    .refine((v) => v.length === 10, "Phone must be 10 digits"),
  website: z
    .string()
    .optional()
    .transform((v) => {
      if (!v) return v;
      if (!v.startsWith("http")) return `https://${v}`;
      return v;
    }),
  city: z.string().min(1, "City is required"),
  state: z.string().default("TX"),
  zip: z.string().regex(/^\d{5}$/, "ZIP must be 5 digits"),
  address: z.string().optional(),
  yearsInBusiness: z.number().int().min(0).max(100).optional(),
  licenseNumber: z.string().optional(),
});

export const listingDetailsSchema = z.object({
  description: z.string().optional(),
  hours: z.record(z.union([z.object({ open: z.string(), close: z.string() }), z.null()])).optional(),
  licenseNumber: z.string().optional(),
  licenseExpiry: z.string().optional(),
});

export const slugSchema = z
  .string()
  .min(3)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only");
