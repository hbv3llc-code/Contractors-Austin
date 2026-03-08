import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name = "there" }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to ContractorsAustin — your free listing is ready to set up</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>

          <Heading style={h1}>Welcome, {name}!</Heading>

          <Text style={text}>
            Your account is created and your free Basic listing is ready to set up. Thousands of
            Austin homeowners search our directory every month — let&apos;s make sure they can find
            you.
          </Text>

          <Section style={callout}>
            <Text style={calloutTitle}>Here&apos;s what to do next:</Text>
            <Text style={calloutItem}>✅ &nbsp;Complete your business profile</Text>
            <Text style={calloutItem}>📸 &nbsp;Upload photos of your work</Text>
            <Text style={calloutItem}>⭐ &nbsp;Invite past customers to leave reviews</Text>
            <Text style={calloutItem}>📞 &nbsp;Upgrade to receive leads directly</Text>
          </Section>

          <Button style={button} href="https://contractorsaustin.com/dashboard">
            Set Up My Listing
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            ContractorsAustin · Austin, TX · You&apos;re receiving this because you created an
            account.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "Arial, sans-serif" };
const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};
const logoSection = { padding: "20px 0 10px" };
const logo = {
  fontSize: "20px",
  fontWeight: "700",
  color: "#1D4ED8",
  margin: "0",
};
const h1 = { fontSize: "24px", fontWeight: "700", color: "#1a1a1a", margin: "24px 0 16px" };
const text = { fontSize: "15px", lineHeight: "1.6", color: "#4a4a4a", margin: "0 0 16px" };
const callout = {
  backgroundColor: "#eff6ff",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "20px 0",
};
const calloutTitle = { fontSize: "14px", fontWeight: "700", color: "#1e40af", margin: "0 0 8px" };
const calloutItem = { fontSize: "14px", color: "#1e40af", margin: "4px 0" };
const button = {
  backgroundColor: "#1D4ED8",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "24px 0",
};
const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" };
const footer = { fontSize: "12px", color: "#9ca3af" };
