/**
 * POST /api/get-quotes
 * Multi-contractor lead routing: matches up to 4 Featured/Premium contractors
 * in the selected city + service category, then fans out lead notifications.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNewLeadEmail } from "@/lib/email";
import { z } from "zod";

const BUDGET_OPTIONS = [
  "Under $500", "$500–$1,000", "$1,000–$5,000",
  "$5,000–$15,000", "$15,000–$50,000", "$50,000+",
] as const;

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

    // Honeypot
    if (body._honeypot) {
      return NextResponse.json({ success: true });
    }

    const parsed = schema.parse(body);

    // Find matching service
    const service = await prisma.service.findFirst({
      where: {
        name: { equals: parsed.service, mode: "insensitive" },
        isPublic: true,
      },
    });

    // Find matching location
    const location = await prisma.location.findFirst({
      where: { name: { equals: parsed.city, mode: "insensitive" } },
    });

    // Find up to 4 contractors matching service + location, Featured/Premium only
    const contractors = await prisma.contractor.findMany({
      where: {
        verifiedStatus: { in: ["claimed", "verified"] },
        membership: { planType: { in: ["featured", "premium"] }, status: "active" },
        ...(service
          ? { services: { some: { serviceId: service.id } } }
          : {}),
        ...(location
          ? { locations: { some: { locationId: location.id } } }
          : { city: { equals: parsed.city, mode: "insensitive" } }),
      },
      include: { membership: true },
      orderBy: [{ membership: { planType: "desc" } }, { rating: "desc" }],
      take: 4,
    });

    if (contractors.length === 0) {
      // Fallback: any Featured/Premium contractors in Austin area
      const fallback = await prisma.contractor.findMany({
        where: {
          verifiedStatus: { in: ["claimed", "verified"] },
          membership: { planType: { in: ["featured", "premium"] }, status: "active" },
        },
        include: { membership: true },
        orderBy: [{ membership: { planType: "desc" } }, { rating: "desc" }],
        take: 4,
      });
      contractors.push(...fallback);
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    // Create leads for each matched contractor
    const leads = await Promise.all(
      contractors.map((contractor) =>
        prisma.lead.create({
          data: {
            contractorId: contractor.id,
            serviceId: service?.id,
            locationId: location?.id,
            name: parsed.name,
            email: parsed.email,
            phone: parsed.phone,
            budgetRange: parsed.budget,
            projectDescription: parsed.description,
            isMultiQuote: true,
            sourcePage: "/get-quotes",
            submitterIp: ip,
          },
        })
      )
    );

    // Fan out email notifications
    const emailPromises = contractors.map((contractor, i) => {
      if (!contractor.email) return Promise.resolve();
      return sendNewLeadEmail(contractor.email, {
        contractorName: contractor.name,
        leadName: parsed.name,
        leadEmail: parsed.email,
        leadPhone: parsed.phone,
        serviceName: parsed.service,
        budgetRange: parsed.budget,
        projectDescription: parsed.description,
        leadId: leads[i].id,
      }).catch((err) => console.error(`Failed to email contractor ${contractor.id}:`, err));
    });
    await Promise.allSettled(emailPromises);

    return NextResponse.json({
      success: true,
      data: { matchedCount: contractors.length },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      error.errors.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message;
      });
      return NextResponse.json(
        { success: false, error: "Validation failed", fields },
        { status: 400 }
      );
    }
    console.error("POST /api/get-quotes error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit request" }, { status: 500 });
  }
}
