import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  status: z.enum(["new", "contacted", "quote_sent", "job_won", "job_lost", "no_response", "spam"]),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the contractor that owns this lead
    const lead = await prisma.lead.findUnique({
      where: { id: params.id },
      include: { contractor: true },
    });

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Verify the authenticated user owns this contractor
    const contractor = await prisma.contractor.findFirst({
      where: { id: lead.contractorId, email: user.email },
    });

    if (!contractor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = updateSchema.parse(body);

    const updated = await prisma.lead.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid status value", details: error.errors },
        { status: 400 }
      );
    }
    console.error("PUT /api/leads/[id] error:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
