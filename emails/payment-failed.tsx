import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from "@react-email/components";

interface PaymentFailedEmailProps {
  contractorName: string;
  amount: string;
}

export default function PaymentFailedEmail({
  contractorName = "there",
  amount = "$9.99",
}: PaymentFailedEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Action required: Your payment of {amount} failed — update your billing to keep your listing active</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>
          <Section style={alertBanner}>
            <Text style={alertText}>⚠️ &nbsp;Payment Failed — Action Required</Text>
          </Section>
          <Heading style={h1}>Hi {contractorName}, we couldn&apos;t process your payment</Heading>
          <Text style={text}>
            We attempted to charge <strong>{amount}</strong> to your card on file, but the payment
            was declined. To avoid interruption to your listing, please update your payment method
            within the next <strong>7 days</strong>.
          </Text>
          <Section style={warningBox}>
            <Text style={warningTitle}>If payment isn&apos;t resolved, you&apos;ll lose:</Text>
            <Text style={warningItem}>• Phone number and website visibility</Text>
            <Text style={warningItem}>• Incoming lead notifications</Text>
            <Text style={warningItem}>• Priority placement in search results</Text>
          </Section>
          <Button style={button} href="https://contractorsaustin.com/dashboard/billing">
            Update Payment Method
          </Button>
          <Text style={smallText}>
            This won&apos;t affect your reviews or profile content. Questions? Reply to this email.
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
const alertBanner = { backgroundColor: "#dc2626", borderRadius: "8px", padding: "10px 16px", margin: "16px 0" };
const alertText = { color: "#fff", fontSize: "14px", fontWeight: "700", margin: "0" };
const h1 = { fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: "20px 0 12px" };
const text = { fontSize: "15px", lineHeight: "1.6", color: "#4a4a4a", margin: "0 0 16px" };
const warningBox = { backgroundColor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "8px", padding: "16px 20px", margin: "16px 0" };
const warningTitle = { fontSize: "13px", fontWeight: "700", color: "#991b1b", margin: "0 0 8px" };
const warningItem = { fontSize: "13px", color: "#b91c1c", margin: "3px 0" };
const button = { backgroundColor: "#dc2626", borderRadius: "8px", color: "#fff", fontSize: "15px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px 24px", margin: "24px 0" };
const smallText = { fontSize: "13px", color: "#6b7280", textAlign: "center" as const };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" };
const footer = { fontSize: "12px", color: "#9ca3af" };
