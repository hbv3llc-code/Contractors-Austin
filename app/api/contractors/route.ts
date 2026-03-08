import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get("service");
    const location = searchParams.get("location");
    const q = searchParams.get("q");
    const plan = searchParams.get("plan");
    const limit = Math.min(Number(searchParams.get("limit") ?? "20"), 50);
    const cursor = searchParams.get("cursor");

    const contractors = await prisma.contractor.findMany({
      where: {
        verifiedStatus: { not: "unclaimed" },
        ...(service && {
          services: { some: { service: { slug: service } } },
        }),
        ...(location && {
          locations: { some: { location: { slug: location } } },
        }),
        ...(plan && { membership: { planType: plan as "basic" | "featured" | "premium" } }),
        ...(q && {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        services: { include: { service: true }, where: { isPrimary: true }, take: 1 },
        membership: true,
        locations: { include: { location: true }, take: 3 },
      },
      orderBy: [
        { membership: { planType: "desc" } },
        { rating: "desc" },
        { reviewCount: "desc" },
      ],
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    });

    const hasMore = contractors.length > limit;
    const data = hasMore ? contractors.slice(0, limit) : contractors;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return NextResponse.json({
      success: true,
      data,
      nextCursor,
      total: data.length,
    });
  } catch (error) {
    console.error("GET /api/contractors error:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch contractors" } },
      { status: 500 }
    );
  }
}
