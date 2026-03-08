"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Phone, Mail, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ImportedListing {
  id: string;
  businessName: string;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
}

interface ClaimWizardProps {
  listing: ImportedListing;
}

type Step = "review" | "method" | "verify" | "done";

const STEPS = ["Review Listing", "Choose Method", "Verify", "Done"] as const;
const STEP_KEYS: Step[] = ["review", "method", "verify", "done"];

export default function ClaimWizard({ listing }: ClaimWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("review");
  const [method, setMethod] = useState<"email_domain" | "phone_sms">("email_domain");
  const [contactValue, setContactValue] = useState(listing.email ?? "");
  const [claimId, setClaimId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const stepIndex = STEP_KEYS.indexOf(step);

  async function initiateClaimRequest() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id, method, contactValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start claim");
      setClaimId(data.data.claimId);
      setStep("verify");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function submitVerificationCode() {
    if (!claimId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/claims/${claimId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Claim Your Listing</h1>
          <p className="text-muted-foreground mt-1">{listing.businessName}</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center mb-8 gap-0">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i < stepIndex
                      ? "bg-green-500 text-white"
                      : i === stepIndex
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <span className="text-xs text-gray-500 mt-1 w-20 text-center">{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-12 mb-5 transition-colors ${
                    i < stepIndex ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Review Listing */}
          {step === "review" && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-4">Is this your business?</h2>
              <div className="rounded-xl border border-border bg-gray-50 p-4 mb-6 space-y-2">
                <p className="font-semibold text-foreground">{listing.businessName}</p>
                {listing.address && (
                  <p className="text-sm text-gray-500">
                    {listing.address}{listing.city ? `, ${listing.city}` : ""}
                  </p>
                )}
                {listing.phone && <p className="text-sm text-gray-500">📞 {listing.phone}</p>}
                {listing.website && (
                  <p className="text-sm text-gray-500 truncate">🌐 {listing.website}</p>
                )}
              </div>
              <p className="text-sm text-gray-500 mb-6">
                To claim this listing, you&apos;ll need to verify ownership via email or phone.
              </p>
              <Button className="w-full gap-2" onClick={() => setStep("method")}>
                Yes, this is my business <ArrowRight className="h-4 w-4" />
              </Button>
              <button
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                onClick={() => router.push("/")}
              >
                Not my business
              </button>
            </div>
          )}

          {/* Step 2: Choose Verification Method */}
          {step === "method" && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">How do you want to verify?</h2>
              <p className="text-sm text-gray-500 mb-6">
                We&apos;ll send a verification code to confirm you own this business.
              </p>

              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    setMethod("email_domain");
                    setContactValue(listing.email ?? "");
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    method === "email_domain"
                      ? "border-primary bg-blue-50"
                      : "border-border hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Business Email</p>
                      <p className="text-xs text-gray-500">
                        Send code to your business email address
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMethod("phone_sms");
                    setContactValue(listing.phone ?? "");
                  }}
                  className={`w-full rounded-xl border p-4 text-left transition-all ${
                    method === "phone_sms"
                      ? "border-primary bg-blue-50"
                      : "border-border hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Business Phone (SMS)</p>
                      <p className="text-xs text-gray-500">
                        Send verification code via text message
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="mb-6">
                <Label htmlFor="contactValue">
                  {method === "email_domain" ? "Business email address" : "Business phone number"}
                </Label>
                <Input
                  id="contactValue"
                  type={method === "email_domain" ? "email" : "tel"}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                  placeholder={
                    method === "email_domain" ? "owner@yourbusiness.com" : "(512) 555-0100"
                  }
                  className="mt-1"
                />
              </div>

              <Button
                className="w-full"
                onClick={initiateClaimRequest}
                disabled={loading || !contactValue}
              >
                {loading ? "Sending code..." : "Send Verification Code"}
              </Button>
              <button
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                onClick={() => setStep("review")}
              >
                Back
              </button>
            </div>
          )}

          {/* Step 3: Enter Verification Code */}
          {step === "verify" && (
            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">Enter verification code</h2>
              <p className="text-sm text-gray-500 mb-6">
                We sent a 6-character code to <strong>{contactValue}</strong>. Enter it below within
                30 minutes.
              </p>

              <div className="mb-6">
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ABC123"
                  maxLength={8}
                  className="mt-1 text-center text-2xl tracking-[0.3em] font-mono uppercase"
                />
              </div>

              <Button
                className="w-full"
                onClick={submitVerificationCode}
                disabled={loading || code.length < 4}
              >
                {loading ? "Verifying..." : "Verify & Claim Listing"}
              </Button>

              <button
                className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700 underline"
                onClick={() => {
                  setCode("");
                  setError(null);
                  initiateClaimRequest();
                }}
                disabled={loading}
              >
                Resend code
              </button>
            </div>
          )}

          {/* Step 4: Done */}
          {step === "done" && (
            <div className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Listing Successfully Claimed!
              </h2>
              <p className="text-gray-500 mb-8">
                You now control <strong>{listing.businessName}</strong>. Complete your profile to
                start attracting customers.
              </p>
              <div className="space-y-3">
                <Button className="w-full" onClick={() => router.push("/dashboard")}>
                  Go to My Dashboard
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push("/pricing")}>
                  Upgrade to Receive Leads
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
