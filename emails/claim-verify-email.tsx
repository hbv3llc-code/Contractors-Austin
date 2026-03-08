import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";

interface ClaimVerifyEmailProps {
  businessName: string;
  verificationCode: string;
}

export default function ClaimVerifyEmail({
  businessName = "Your Business",
  verificationCode = "ABC123",
}: ClaimVerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your verification code for claiming {businessName} on ContractorsAustin</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>
          <Heading style={h1}>Verify your claim for {businessName}</Heading>
          <Text style={text}>
            You requested to claim this business listing on ContractorsAustin. Enter the code below
            to verify that you have access to this business&apos;s email domain.
          </Text>
          <Section style={codeBox}>
            <Text style={codeLabel}>Your verification code</Text>
            <Text style={code}>{verificationCode}</Text>
            <Text style={expiry}>This code expires in 30 minutes</Text>
          </Section>
          <Text style={text}>
            If you did not request this, you can safely ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>ContractorsAustin · Austin, TX</Text>
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
const codeBox = { backgroundColor: "#eff6ff", border: "2px dashed #93c5fd", borderRadius: "12px", padding: "24px", textAlign: "center" as const, margin: "24px 0" };
const codeLabel = { fontSize: "13px", color: "#3b82f6", fontWeight: "600", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: "0.05em" };
const code = { fontSize: "40px", fontWeight: "800", color: "#1d4ed8", letterSpacing: "0.2em", margin: "0 0 8px", fontFamily: "monospace" };
const expiry = { fontSize: "12px", color: "#6b7280", margin: "0" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" };
const footer = { fontSize: "12px", color: "#9ca3af" };
