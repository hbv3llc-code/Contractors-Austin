"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const planOptions = [
  { value: "basic", label: "Basic — Free", description: "Get listed, build your profile" },
  { value: "featured", label: "Featured — $9.99/mo", description: "Phone visible, receive leads" },
  { value: "premium", label: "Premium — $19.99/mo", description: "Top placement, all features" },
];

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan") ?? "basic";

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!agreed) {
      setError("Please agree to the Terms of Use and Privacy Policy.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { plan },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-border bg-white p-8 shadow-sm text-center">
        <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Check Your Email!</h1>
        <p className="text-gray-500 mb-4">
          We sent a verification link to <strong>{email}</strong>. Click the link to activate
          your account and start building your listing.
        </p>
        <Button variant="outline" asChild>
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary mx-auto mb-4">
          <UserPlus className="h-6 w-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Create Your Free Listing</h1>
        <p className="text-muted-foreground mt-1">
          Join Austin&apos;s fastest-growing contractor directory
        </p>
      </div>

      {/* Plan selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-foreground mb-2">Select your plan</p>
        <div className="space-y-2">
          {planOptions.map((opt) => (
            <Link
              key={opt.value}
              href={`/signup?plan=${opt.value}`}
              className={`block rounded-lg border p-3 text-sm transition-all ${
                plan === opt.value
                  ? "border-primary bg-blue-50"
                  : "border-border hover:border-gray-300"
              }`}
            >
              <span className="font-semibold text-foreground">{opt.label}</span>
              <span className="block text-xs text-muted-foreground">{opt.description}</span>
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat password"
            required
            className="mt-1"
          />
        </div>
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <Label htmlFor="agree" className="text-sm text-gray-600 font-normal leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Use</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </Label>
        </div>
        <Button type="submit" className="w-full" disabled={loading} size="lg">
          {loading ? "Creating account..." : "Create My Profile"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
