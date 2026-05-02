import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { reviewSchema } from "@/lib/validations/review";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reviewSchema.parse(body);
    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("Contractor")
      .select("id")
      .eq("id", parsed.contractorId)
      .maybeSingle();

    if (!contractor) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contractor not found" } },
        { status: 404 }
      );
    }

    const { data: review, error } = await admin
      .from("Review")
      .insert({
        contractorId: parsed.contractorId,
        reviewerName: parsed.reviewerName,
        reviewerEmail: parsed.reviewerEmail,
        rating: parsed.rating,
        ratingService: parsed.ratingService ?? null,
        ratingResults: parsed.ratingResults ?? null,
        ratingExpertise: parsed.ratingExpertise ?? null,
        ratingCommunication: parsed.ratingCommunication ?? null,
        ratingResponsiveness: parsed.ratingResponsiveness ?? null,
        reviewText: parsed.reviewText,
        projectType: parsed.projectType ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: { id: review.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      error.errors.forEach((e) => { if (e.path[0]) fields[String(e.path[0])] = e.message; });
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Validation failed", fields } },
        { status: 400 }
      );
    }
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to submit review" } },
      { status: 500 }
    );
  }
}
