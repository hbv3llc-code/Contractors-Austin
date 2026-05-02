import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const daySchema = z.object({
  open: z.boolean(),
  from: z.string().regex(/^\d{2}:\d{2}$/),
  to: z.string().regex(/^\d{2}:\d{2}$/),
});

const schema = z.object({
  contractorId: z.string().uuid(),
  hours: z.record(z.string(), daySchema),
});

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { contractorId, hours } = schema.parse(body);

    const admin = createAdminClient();

    const { data: contractor } = await admin
      .from("Contractor")
      .select("id")
      .eq("id", contractorId)
      .or(`userId.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (!contractor) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { error } = await admin
      .from("Contractor")
      .update({ hours })
      .eq("id", contractorId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("PATCH /api/dashboard/hours error:", error);
    return NextResponse.json({ error: "Failed to save hours" }, { status: 500 });
  }
}
