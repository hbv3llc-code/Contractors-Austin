import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/review";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = reviewSchema.parse(body);

    const contractor = await prisma.contractor.findUnique({
      where: { id: parsed.contractorId },
    });

    if (!contractor) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contractor not found" } },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        contractorId: parsed.contractorId,
        reviewerName: parsed.reviewerName,
        reviewerEmail: parsed.reviewerEmail,
        rating: parsed.rating,
        ratingService: parsed.ratingService,
        ratingResults: parsed.ratingResults,
        ratingExpertise: parsed.ratingExpertise,
        ratingCommunication: parsed.ratingCommunication,
        ratingResponsiveness: parsed.ratingResponsiveness,
        reviewText: parsed.reviewText,
        projectType: parsed.projectType,
        status: "pending",
      },
    });

    return NextResponse.json(
      { success: true, data: { id: review.id } },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields: Record<string, string> = {};
      error.errors.forEach((e) => {
        if (e.path[0]) fields[String(e.path[0])] = e.message;
      });
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
