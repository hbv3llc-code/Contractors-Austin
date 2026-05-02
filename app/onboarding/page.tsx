export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import OnboardingForm from "@/components/forms/onboarding-form";
import { VerifiedToast } from "@/components/dashboard/verified-toast";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Set Up Your Business" };

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let contractor = null;
  let services: { id: string; name: string }[] = [];

  try {
    contractor = await prisma.contractor.findFirst({
      where: { OR: [{ userId: user.id }, { email: user.email! }] },
      include: { services: { include: { service: true } } },
    });
    services = await prisma.service.findMany({
      where: { isPublic: true, isActive: true, level: 0 },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true },
    });
  } catch {}

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-border px-6 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <span className="text-xs font-bold text-white">CA</span>
        </div>
      </header>
      <Suspense><VerifiedToast /></Suspense>
      <div className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Set up your business listing</h1>
            <p className="text-muted-foreground mt-2">
              Fill in your business details to get listed on ContractorsAustin.
            </p>
          </div>
          <OnboardingForm
            contractor={contractor}
            userEmail={user.email ?? ""}
            services={services}
          />
        </div>
      </div>
    </div>
  );
}
