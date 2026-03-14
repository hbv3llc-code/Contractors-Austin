export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Account Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your email, password, and notification preferences</p>
      </div>
      <SettingsForm email={user?.email ?? ""} />
    </div>
  );
}
