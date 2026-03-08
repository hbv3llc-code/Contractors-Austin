/**
 * POST /api/claims
 * Initiate a claim request for an imported listing.
 * Body: { listingId, method: "email_domain" | "phone_sms", contactValue }
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { sendClaimVerifyEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  listingId: z.string().uuid(),
  method: z.enum(["email_domain", "phone_sms"]),
  contactValue: z.string().min(3), // email address or phone number
});

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { listingId, method, contactValue } = schema.parse(body);

    const listing = await prisma.importedListing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (listing.status === "claimed") {
      return NextResponse.json({ error: "This listing has already been claimed" }, { status: 409 });
    }

    // Delete any existing pending claim for this listing
    await prisma.claimRequest.deleteMany({
      where: { listingId, status: "pending" },
    });

    const code = generateCode();

    const claim = await prisma.claimRequest.create({
      data: {
        listingId,
        memberId: user.id,
        verificationMethod: method === "email_domain" ? "email_domain" : "phone_sms",
        verificationCode: code,
        status: "pending",
      },
    });

    // Send verification
    if (method === "email_domain") {
      await sendClaimVerifyEmail(contactValue, listing.businessName, code).catch((err) =>
        console.error("Failed to send claim verify email:", err)
      );
    } else {
      // SMS via Twilio — graceful fallback if not configured
      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `Your ContractorsAustin verification code for ${listing.businessName}: ${code}. Expires in 30 minutes.`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: contactValue,
        });
      } catch (err) {
        console.error("Failed to send SMS:", err);
      }
    }

    return NextResponse.json({ success: true, data: { claimId: claim.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", details: error.errors }, { status: 400 });
    }
    console.error("POST /api/claims error:", error);
    return NextResponse.json({ error: "Failed to initiate claim" }, { status: 500 });
  }
}
