import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";

interface ClaimOutreachEmailProps {
  businessName: string;
  claimUrl: string;
}

export default function ClaimOutreachEmail({
  businessName = "Your Business",
  claimUrl = "https://contractorsaustin.com/claim/listing-id",
}: ClaimOutreachEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Is this your business? Claim your free listing on ContractorsAustin</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>
          <Heading style={h1}>We listed {businessName} on ContractorsAustin</Heading>
          <Text style={text}>
            We&apos;ve added your business to Austin&apos;s fastest-growing contractor directory.
            Homeowners are already viewing your profile.
          </Text>
          <Text style={text}>
            <strong>Claim your free listing</strong> to take control of your profile, respond to
            reviews, and start receiving leads.
          </Text>
          <Section style={benefitBox}>
            <Text style={benefitTitle}>What you get for free:</Text>
            <Text style={benefitItem}>✓ &nbsp;Business profile with your services</Text>
            <Text style={benefitItem}>✓ &nbsp;Customer reviews and ratings</Text>
            <Text style={benefitItem}>✓ &nbsp;Appear in local search results</Text>
            <Text style={benefitItem}>✓ &nbsp;No credit card required</Text>
          </Section>
          <Button style={button} href={claimUrl}>
            Claim My Free Listing
          </Button>
          <Text style={smallText}>
            Already claimed? <a href="https://contractorsaustin.com/login" style={link}>Sign in here</a>. Not your business?{" "}
            <a href={`${claimUrl}?action=not-mine`} style={link}>Let us know</a>.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            ContractorsAustin · Austin, TX · This is a one-time outreach email.
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
const benefitBox = { backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "16px 20px", margin: "16px 0" };
const benefitTitle = { fontSize: "13px", fontWeight: "700", color: "#166534", margin: "0 0 8px" };
const benefitItem = { fontSize: "14px", color: "#166534", margin: "4px 0" };
const button = { backgroundColor: "#1D4ED8", borderRadius: "8px", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px 24px", margin: "24px 0" };
const smallText = { fontSize: "13px", color: "#6b7280", textAlign: "center" as const };
const link = { color: "#1D4ED8" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" };
const footer = { fontSize: "12px", color: "#9ca3af" };
