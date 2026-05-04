import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendNewLeadEmail } from "@/lib/email";
import { z } from "zod";

const BUDGET_OPTIONS = ["Under $500", "$500–$1,000", "$1,000–$5,000", "$5,000–$15,000", "$15,000–$50,000", "$50,000+"] as const;

const schema = z.object({
  service: z.string().min(1),
  city: z.string().min(1),
  description: z.string().min(10, "Please describe your project in more detail"),
  budget: z.enum(BUDGET_OPTIONS).optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  _honeypot: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body._honeypot) return NextResponse.json({ success: true });

    const parsed = schema.parse(body);
    const admin = createAdminClient();

    const [{ data: service }, { data: location }] = await Promise.all([
      admin.from("Service").select("id").ilike("name", parsed.service).eq("isPublic", true).maybeSingle(),
      admin.from("Location").select("id").ilike("name", parsed.city).maybeSingle(),
    ]);

    // Find up to 4 matching contractors (Featured/Premium)
    let { data: contractors } = await admin
      .from("Contractor")
      .select("id, name, email, Membership!inner(planType, status)")
      .in("verifiedStatus", ["claimed", "verified"])
      .in("Membership.planType", ["featured", "premium"])
      .eq("Membership.status", "active")
      .order("rating", { ascending: false })
      .limit(4);

    if (!contractors || contractors.length === 0) {
      const { data: fallback } = await admin
        .from("Contractor")
        .select("id, name, email, Membership!inner(planType, status)")
        .in("verifiedStatus", ["claimed", "verified"])
        .in("Membership.planType", ["featured", "premium"])
        .eq("Membership.status", "active")
        .order("rating", { ascending: false })
        .limit(4);
      contractors = fallback ?? [];
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    const leads = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (contractors ?? []).map((contractor: any) =>
        admin.from("Lead").insert({
          contractorId: contractor.id,
          serviceId: service?.id ?? null,
          locationId: location?.id ?? null,
          name: parsed.name,
          email: parsed.email,
          phone: parsed.phone ?? null,
          budgetRange: parsed.budget ?? null,
          projectDescription: parsed.description,
          isMultiQuote: true,
          sourcePage: "/get-quotes",
          submitterIp: ip,
        }).select().single()
      )
    );

    const emailPromises = (contractors ?? []).map((contractor: any, i: number) => {
      if (!contractor.email) return Promise.resolve();
      const lead = leads[i]?.data;
      return sendNewLeadEmail(contractor.email, {
        contractorName: contractor.name,
        leadName: parsed.name,
        leadEmail: parsed.email,
        leadPhone: parsed.phone,
        serviceName: parsed.service,
        budgetRange: parsed.budget,
        projectDescription: parsed.description,
        leadId: lead?.id ?? "",
      }).catch((err: unknown) => console.error(`Failed to email contractor ${contractor.id}:`, err));
    });
    await Promise.allSettled(emailPromises);

    return NextResponse.json({ success: true, data: { matchedCount: contractors?.length ?? 0 } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      error.errors.forEach((e) => { if (e.path[0]) fields[String(e.path[0])] = e.message; });
      return NextResponse.json({ success: false, error: "Validation failed", fields }, { status: 400 });
    }
    console.error("POST /api/get-quotes error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit request" }, { status: 500 });
  }
}
