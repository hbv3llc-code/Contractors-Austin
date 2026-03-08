import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";

interface SubscriptionConfirmedEmailProps {
  contractorName: string;
  plan: string;
}

const PLAN_PERKS: Record<string, string[]> = {
  Featured: [
    "Phone number displayed on your profile",
    "Receive leads directly from homeowners",
    "Priority placement above Basic listings",
    "Profile badge: Featured Pro",
  ],
  Premium: [
    "Top placement in search results",
    "Phone number & website displayed",
    "Receive leads directly from homeowners",
    "Profile badge: Premium Pro",
    "Highlighted listing card",
    "Get Matched priority routing",
  ],
};

export default function SubscriptionConfirmedEmail({
  contractorName = "there",
  plan = "Featured",
}: SubscriptionConfirmedEmailProps) {
  const perks = PLAN_PERKS[plan] ?? PLAN_PERKS["Featured"];

  return (
    <Html>
      <Head />
      <Preview>Your {plan} plan is now active — here&apos;s what you unlocked</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>
          <Section style={successBanner}>
            <Text style={successText}>✅ &nbsp;Subscription Confirmed</Text>
          </Section>
          <Heading style={h1}>You&apos;re now on the {plan} plan, {contractorName}!</Heading>
          <Text style={text}>
            Your subscription is active. Here&apos;s what you now have access to:
          </Text>
          <Section style={perkBox}>
            {perks.map((perk) => (
              <Text key={perk} style={perkItem}>✓ &nbsp;{perk}</Text>
            ))}
          </Section>
          <Button style={button} href="https://contractorsaustin.com/dashboard">
            Go to My Dashboard
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            Questions? Reply to this email or visit{" "}
            <a href="https://contractorsaustin.com/dashboard/billing" style={footerLink}>
              billing settings
            </a>{" "}
            to manage your plan.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" };
const container = { margin: "0 auto", padding: "20px 0 48px", maxWidth: "560px" };
const logoSection = { padding: "20px 0 10px" };
const logo = { fontSize: "20px", fontWeight: "700", color: "#1D4ED8", margin: "0" };
const successBanner = { backgroundColor: "#16a34a", borderRadius: "8px", padding: "10px 16px", margin: "16px 0" };
const successText = { color: "#fff", fontSize: "14px", fontWeight: "700", margin: "0" };
const h1 = { fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: "20px 0 12px" };
const text = { fontSize: "15px", lineHeight: "1.6", color: "#4a4a4a", margin: "0 0 16px" };
const perkBox = { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "16px 20px", margin: "16px 0" };
const perkItem = { fontSize: "14px", color: "#166534", margin: "4px 0" };
const button = { backgroundColor: "#1D4ED8", borderRadius: "8px", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px 24px", margin: "24px 0" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" };
const footer = { fontSize: "12px", color: "#9ca3af" };
const footerLink = { color: "#9ca3af" };
