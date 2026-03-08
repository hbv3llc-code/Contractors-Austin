import { z } from "zod";

export const BUDGET_OPTIONS = [
  "Under $500",
  "$500–$1,000",
  "$1,000–$5,000",
  "$5,000–$15,000",
  "$15,000–$50,000",
  "$50,000+",
] as const;

export const leadSchema = z.object({
  contractorId: z.string().uuid(),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : v)),
  budgetRange: z.enum(BUDGET_OPTIONS).optional(),
  projectDescription: z
    .string()
    .min(20, "Please describe your project in at least 20 characters"),
  preferredContactDay: z.string().optional(),
  preferredContactTime: z.string().optional(),
  serviceId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  isMultiQuote: z.boolean().default(false),
  sourcePage: z.string().optional(),
});

export const multiLeadSchema = z.object({
  contractorIds: z.array(z.string().uuid()).min(1).max(4),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z
    .string()
    .optional()
    .transform((v) => (v ? v.replace(/\D/g, "") : v)),
  budgetRange: z.enum(BUDGET_OPTIONS).optional(),
  projectDescription: z
    .string()
    .min(20, "Please describe your project in at least 20 characters"),
  preferredContactDay: z.string().optional(),
  preferredContactTime: z.string().optional(),
  serviceId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
  sourcePage: z.string().optional(),
});
