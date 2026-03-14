"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Lock, Mail } from "lucide-react";

export function SettingsForm({ email }: { email: string }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const { toast } = useToast();

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Passwords don't match" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ variant: "destructive", title: "Password must be at least 8 characters" });
      return;
    }

    setSavingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated successfully" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update password";
      toast({ variant: "destructive", title: "Error", description: msg });
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Account info */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Account Information</h2>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Email Address</Label>
            <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-2.5">
              <span className="text-sm text-foreground">{email}</span>
              <CheckCircle className="h-4 w-4 text-green-500 ml-auto flex-shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your email is used to log in and receive notifications.
            </p>
          </div>
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="mt-1"
              minLength={8}
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className="mt-1"
              minLength={8}
              required
            />
          </div>
          <Button type="submit" disabled={savingPassword}>
            {savingPassword ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-foreground mb-2">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">
          To delete your account or listing, please contact us at{" "}
          <a href="mailto:support@contractorsaustin.com" className="text-primary hover:underline">
            support@contractorsaustin.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
