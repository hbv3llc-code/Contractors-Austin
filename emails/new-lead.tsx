import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Column,
  Section,
  Text,
} from "@react-email/components";

interface NewLeadEmailProps {
  contractorName: string;
  leadName: string;
  leadEmail: string;
  leadPhone?: string;
  serviceName?: string;
  budgetRange?: string;
  projectDescription: string;
  leadId: string;
}

export default function NewLeadEmail({
  contractorName = "there",
  leadName = "John Smith",
  leadEmail = "john@email.com",
  leadPhone,
  serviceName = "Home Services",
  budgetRange,
  projectDescription = "Project description here",
  leadId = "lead-id",
}: NewLeadEmailProps) {
  const dashboardUrl = `https://contractorsaustin.com/dashboard/leads`;

  return (
    <Html>
      <Head />
      <Preview>
        New lead from {leadName} — {serviceName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logo}>ContractorsAustin</Text>
          </Section>

          <Section style={alertBanner}>
            <Text style={alertText}>🔔 &nbsp;New Lead Received</Text>
          </Section>

          <Heading style={h1}>Hi {contractorName}, you have a new lead!</Heading>

          <Text style={text}>
            A homeowner is looking for help with <strong>{serviceName}</strong>. Contact them quickly
            — contractors who respond within 1 hour win 80% more jobs.
          </Text>

          <Section style={leadCard}>
            <Heading style={h2}>Lead Details</Heading>
            <Row>
              <Column style={labelCol}>Name</Column>
              <Column style={valueCol}>{leadName}</Column>
            </Row>
            <Row>
              <Column style={labelCol}>Email</Column>
              <Column style={valueCol}>{leadEmail}</Column>
            </Row>
            {leadPhone && (
              <Row>
                <Column style={labelCol}>Phone</Column>
                <Column style={valueCol}>{leadPhone}</Column>
              </Row>
            )}
            {budgetRange && (
              <Row>
                <Column style={labelCol}>Budget</Column>
                <Column style={valueCol}>{budgetRange}</Column>
              </Row>
            )}
            <Hr style={innerHr} />
            <Text style={descLabel}>Project Description</Text>
            <Text style={descText}>{projectDescription}</Text>
          </Section>

          <Button style={button} href={dashboardUrl}>
            View Lead &amp; Respond
          </Button>

          <Hr style={hr} />
          <Text style={footer}>
            ContractorsAustin · You received this because you&apos;re on a Featured or Premium plan
            · <a href="https://contractorsaustin.com/dashboard/billing" style={footerLink}>Manage subscription</a>
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
const alertBanner = {
  backgroundColor: "#16a34a",
  borderRadius: "8px",
  padding: "10px 16px",
  margin: "16px 0",
};
const alertText = { color: "#fff", fontSize: "14px", fontWeight: "700", margin: "0" };
const h1 = { fontSize: "22px", fontWeight: "700", color: "#1a1a1a", margin: "20px 0 12px" };
const h2 = { fontSize: "16px", fontWeight: "700", color: "#1a1a1a", margin: "0 0 12px" };
const text = { fontSize: "15px", lineHeight: "1.6", color: "#4a4a4a", margin: "0 0 16px" };
const leadCard = {
  backgroundColor: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};
const labelCol = { fontSize: "13px", color: "#6b7280", width: "100px", paddingBottom: "8px" };
const valueCol = { fontSize: "14px", color: "#111827", fontWeight: "600", paddingBottom: "8px" };
const innerHr = { borderColor: "#f3f4f6", margin: "12px 0" };
const descLabel = { fontSize: "13px", color: "#6b7280", margin: "0 0 4px" };
const descText = { fontSize: "14px", color: "#374151", margin: "0" };
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
const footerLink = { color: "#9ca3af" };
