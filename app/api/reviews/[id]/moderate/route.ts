import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

const schema = z.object({
  action: z.enum(["approve", "reject"]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { action } = schema.parse(await request.json());

    const review = await prisma.review.update({
      where: { id: params.id },
      data: { status: action === "approve" ? "approved" : "rejected" },
      include: { contractor: true },
    });

    // Update contractor rating if approved
    if (action === "approve") {
      const reviews = await prisma.review.findMany({
        where: { contractorId: review.contractorId, status: "approved" },
        select: { rating: true },
      });
      const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await prisma.contractor.update({
        where: { id: review.contractorId },
        data: { rating: avg, reviewCount: reviews.length },
      });
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 });
  }
}
