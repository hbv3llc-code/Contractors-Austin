import React from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import WelcomeEmail from "@/emails/welcome";
import NewLeadEmail from "@/emails/new-lead";
import SubscriptionConfirmedEmail from "@/emails/subscription-confirmed";
import SubscriptionCancelledEmail from "@/emails/subscription-cancelled";
import PaymentFailedEmail from "@/emails/payment-failed";
import DidYouHireEmail from "@/emails/did-you-hire";
import ClaimVerifyEmail from "@/emails/claim-verify-email";
import ClaimOutreachEmail from "@/emails/claim-outreach";

const FROM = "ContractorsAustin <hello@contractorsaustin.com>";

// ─── Helpers ────────────────────────────────────────────────────────────────

function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder_key_not_configured");
}

async function send(to: string, subject: string, react: React.ReactElement) {
  const html = await render(react);
  return getResend().emails.send({ from: FROM, to, subject, html });
}

// ─── Welcome ─────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(to: string, name: string) {
  return send(to, "Welcome to ContractorsAustin!", <WelcomeEmail name={name} />);
}

// ─── New Lead Notification ────────────────────────────────────────────────────

export interface LeadEmailData {
  contractorName: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  serviceName?: string;
  budgetRange?: string;
  projectDescription: string;
  leadId: string;
}

export async function sendNewLeadEmail(to: string, data: LeadEmailData) {
  return send(
    to,
    `New lead: ${data.leadName} needs ${data.serviceName ?? "your services"}`,
    <NewLeadEmail {...data} />
  );
}

// ─── Subscription Confirmed ───────────────────────────────────────────────────

export async function sendSubscriptionConfirmedEmail(
  to: string,
  contractorName: string,
  plan: string
) {
  return send(
    to,
    `Your ${plan} plan is now active`,
    <SubscriptionConfirmedEmail contractorName={contractorName} plan={plan} />
  );
}

// ─── Subscription Cancelled ───────────────────────────────────────────────────

export async function sendSubscriptionCancelledEmail(
  to: string,
  contractorName: string,
  periodEnd: string
) {
  return send(
    to,
    "Your subscription has been cancelled",
    <SubscriptionCancelledEmail contractorName={contractorName} periodEnd={periodEnd} />
  );
}

// ─── Payment Failed ───────────────────────────────────────────────────────────

export async function sendPaymentFailedEmail(
  to: string,
  contractorName: string,
  amount: string
) {
  return send(
    to,
    "Action required: Payment failed",
    <PaymentFailedEmail contractorName={contractorName} amount={amount} />
  );
}

// ─── Did You Hire? ────────────────────────────────────────────────────────────

export async function sendDidYouHireEmail(
  to: string,
  homeownerName: string,
  contractorName: string,
  leadId: string
) {
  return send(
    to,
    `Did you hire ${contractorName}?`,
    <DidYouHireEmail
      homeownerName={homeownerName}
      contractorName={contractorName}
      leadId={leadId}
    />
  );
}

// ─── Claim Verify Email ───────────────────────────────────────────────────────

export async function sendClaimVerifyEmail(
  to: string,
  businessName: string,
  verificationCode: string
) {
  return send(
    to,
    `Verify your claim: ${businessName}`,
    <ClaimVerifyEmail businessName={businessName} verificationCode={verificationCode} />
  );
}

// ─── Claim Outreach ───────────────────────────────────────────────────────────

export async function sendClaimOutreachEmail(
  to: string,
  businessName: string,
  claimUrl: string
) {
  return send(
    to,
    `Is this your business? Claim your free listing on ContractorsAustin`,
    <ClaimOutreachEmail businessName={businessName} claimUrl={claimUrl} />
  );
}
