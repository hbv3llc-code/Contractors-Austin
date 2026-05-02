import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { leadSchema } from "@/lib/validations/lead";
import { sendNewLeadEmail } from "@/lib/email";
import { z } from "zod";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const limit = 3;
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (record.count >= limit) return false;
  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try again in 1 hour." } },
        { status: 429 }
      );
    }

    const body = await request.json();
    if (body._honeypot) return NextResponse.json({ success: true, data: { id: "fake" } });

    const parsed = leadSchema.parse(body);
    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("Contractor")
      .select("id, name, email, verifiedStatus, Membership(planType)")
      .eq("id", parsed.contractorId)
      .maybeSingle();

    if (!contractor) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contractor not found" } },
        { status: 404 }
      );
    }

    if (contractor.verifiedStatus === "unclaimed") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "This contractor has not claimed their listing" } },
        { status: 403 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const membership = Array.isArray((contractor as any).Membership) ? (contractor as any).Membership[0] : (contractor as any).Membership;
    const planType = membership?.planType;
    if (!planType || planType === "basic") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "This contractor is on the Basic plan and does not receive leads" } },
        { status: 403 }
      );
    }

    const { data: lead, error: leadError } = await admin
      .from("Lead")
      .insert({
        contractorId: parsed.contractorId,
        serviceId: parsed.serviceId ?? null,
        locationId: parsed.locationId ?? null,
        name: parsed.name,
        email: parsed.email,
        phone: parsed.phone ?? null,
        budgetRange: parsed.budgetRange ?? null,
        projectDescription: parsed.projectDescription,
        preferredContactDay: parsed.preferredContactDay ?? null,
        preferredContactTime: parsed.preferredContactTime ?? null,
        isMultiQuote: parsed.isMultiQuote ?? false,
        sourcePage: parsed.sourcePage ?? request.headers.get("referer"),
        submitterIp: ip,
      })
      .select()
      .single();

    if (leadError) throw leadError;

    if (contractor.email) {
      let serviceName: string | undefined;
      if (parsed.serviceId) {
        const { data: svc } = await admin.from("Service").select("name").eq("id", parsed.serviceId).maybeSingle();
        serviceName = svc?.name;
      }
      sendNewLeadEmail(contractor.email, {
        contractorName: contractor.name,
        leadName: parsed.name,
        leadEmail: parsed.email,
        leadPhone: parsed.phone,
        serviceName,
        budgetRange: parsed.budgetRange,
        projectDescription: parsed.projectDescription,
        leadId: lead.id,
      }).catch((err) => console.error("Failed to send lead email:", err));
    }

    return NextResponse.json({ success: true, data: { id: lead.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      error.errors.forEach((e) => { if (e.path[0]) fields[String(e.path[0])] = e.message; });
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Validation failed", fields } },
        { status: 400 }
      );
    }
    console.error("POST /api/leads error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to submit lead" } },
      { status: 500 }
    );
  }
}
