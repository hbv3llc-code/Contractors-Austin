import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { slug: params.slug },
      include: {
        services: { include: { service: true } },
        locations: { include: { location: true } },
        reviews: { where: { status: "approved" }, orderBy: { createdAt: "desc" }, take: 10 },
        membership: true,
        photos: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!contractor) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Contractor not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: contractor });
  } catch (error) {
    console.error("GET /api/contractors/[slug] error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch contractor" } },
      { status: 500 }
    );
  }
}
