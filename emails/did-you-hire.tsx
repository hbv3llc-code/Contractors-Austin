import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Row, Column, Section, Text,
} from "@react-email/components";

interface DidYouHireEmailProps {
  homeownerName: string;
  contractorName: string;
  leadId: string;
}

export default function DidYouHireEmail({
  homeownerName = "there",
  contractorName = "the contractor",
  leadId = "lead-id",
}: DidYouHireEmailProps) {
  const hiredUrl = `https://contractorsaustin.com/api/leads/${leadId}/hired?response=yes`;
  const notHiredUrl = `https://contractorsaustin.com/api/leads/${leadId}/hired?response=no`;
  const reviewUrl = `https://contractorsaustin.com/api/leads/${leadId}/hired?response=yes&review=1`;

  return (
    <Html>
      <Head />
      <Preview>Did you hire {contractorName}? Let us know — it helps other homeowners!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>
          <Heading style={h1}>Hi {homeownerName}, did you hire {contractorName}?</Heading>
          <Text style={text}>
            We noticed you recently requested a quote. Let us know how it went — your feedback helps
            other Austin homeowners choose the right contractor.
          </Text>
          <Section style={buttonRow}>
            <Row>
              <Column style={{ paddingRight: "8px" }}>
                <Button style={yesButton} href={reviewUrl}>
                  ✅ Yes, and I&apos;ll leave a review
                </Button>
              </Column>
              <Column style={{ paddingLeft: "8px" }}>
                <Button style={noButton} href={notHiredUrl}>
                  ❌ No, I didn&apos;t hire them
                </Button>
              </Column>
            </Row>
          </Section>
          <Text style={smallText}>
            Hired them but prefer not to review?{" "}
            <a href={hiredUrl} style={link}>Click here</a> to let us know without writing a review.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            ContractorsAustin · You&apos;re receiving this because you requested a quote ·{" "}
            <a href={`https://contractorsaustin.com/api/leads/${leadId}/unsubscribe`} style={footerLink}>
              Unsubscribe
            </a>
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
const buttonRow = { margin: "20px 0" };
const yesButton = { backgroundColor: "#16a34a", borderRadius: "8px", color: "#fff", fontSize: "14px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px 16px" };
const noButton = { backgroundColor: "#6b7280", borderRadius: "8px", color: "#fff", fontSize: "14px", fontWeight: "600", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px 16px" };
const smallText = { fontSize: "13px", color: "#6b7280", textAlign: "center" as const, margin: "16px 0" };
const link = { color: "#1D4ED8" };
const hr = { borderColor: "#e5e7eb", margin: "32px 0 16px" };
const footer = { fontSize: "12px", color: "#9ca3af" };
const footerLink = { color: "#9ca3af" };
