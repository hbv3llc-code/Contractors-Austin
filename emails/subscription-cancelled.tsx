import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";

interface SubscriptionCancelledEmailProps {
  contractorName: string;
  periodEnd: string;
}

export default function SubscriptionCancelledEmail({
  contractorName = "there",
  periodEnd = "January 1, 2026",
}: SubscriptionCancelledEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your subscription has been cancelled — your listing remains active until {periodEnd}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>
          <Heading style={h1}>Subscription Cancelled</Heading>
          <Text style={text}>
            Hi {contractorName}, we&apos;ve received your cancellation request. Your listing will
            remain active through <strong>{periodEnd}</strong>, after which it will revert to the
            free Basic plan.
          </Text>
          <Section style={infoBox}>
            <Text style={infoTitle}>What changes on {periodEnd}:</Text>
            <Text style={infoItem}>• Phone number and website will be hidden</Text>
            <Text style={infoItem}>• Leads will stop being delivered</Text>
            <Text style={infoItem}>• Listing drops to standard placement</Text>
            <Text style={infoItem}>• Your profile and reviews are preserved</Text>
          </Section>
          <Text style={text}>
            Changed your mind? You can reactivate at any time before {periodEnd}.
          </Text>
          <Button style={button} href="https://contractorsaustin.com/pricing">
            Reactivate My Plan
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            ContractorsAustin · Austin, TX
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
const h1 = { fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: "24px 0 16px" };
const text = { fontSize: "15px", lineHeight: "1.6", color: "#4a4a4a", margin: "0 0 16px" };
const infoBox = { backgroundColor: "#fefce8", border: "1px solid #fef08a", borderRadius: "8px", padding: "16px 20px", margin: "16px 0" };
const infoTitle = { fontSize: "13px", fontWeight: "700", color: "#713f12", margin: "0 0 8px" };
const infoItem = { fontSize: "13px", color: "#854d0e", margin: "3px 0" };
const button = { backgroundColor: "#1D4ED8", borderRadius: "8px", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px 24px", margin: "24px 0" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" };
const footer = { fontSize: "12px", color: "#9ca3af" };
