import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const admin = createAdminClient();

    const { data: review } = await admin
      .from("Review")
      .update({ status: action === "approve" ? "approved" : "rejected" })
      .eq("id", params.id)
      .select("id, contractorId, rating")
      .single();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (action === "approve") {
      const { data: reviews } = await admin
        .from("Review")
        .select("rating")
        .eq("contractorId", review.contractorId)
        .eq("status", "approved");

      const reviewList = reviews ?? [];
      const avg = reviewList.length > 0
        ? reviewList.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewList.length
        : 0;

      await admin
        .from("Contractor")
        .update({ rating: avg, reviewCount: reviewList.length })
        .eq("id", review.contractorId);
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 });
  }
}
