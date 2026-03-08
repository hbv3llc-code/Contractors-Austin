import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "ContractorsAustin.com terms of use and service agreement.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-border py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Terms of Use</h1>
            <p className="text-gray-500 mt-2">Last updated: March 2026</p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-xl border border-border bg-white p-8 shadow-sm prose prose-gray max-w-none">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using ContractorsAustin.com, you agree to be bound by these Terms of Use. If you do not agree, do not use our services.</p>

            <h2>2. Description of Service</h2>
            <p>ContractorsAustin.com is an online directory connecting homeowners in Austin, TX and surrounding cities with local home service contractors. We do not employ contractors, guarantee their work, or act as a party to any agreement between homeowners and contractors.</p>

            <h2>3. Contractor Listings</h2>
            <p>Contractor listings may include information from public sources. ContractorsAustin.com does not independently verify all business information. "Verified" badges indicate that a contractor has completed our verification process and submitted proof of license and insurance — not a guarantee of service quality.</p>

            <h2>4. User Responsibilities</h2>
            <p>Users agree to provide accurate information, use the platform only for lawful purposes, not to submit false reviews or fraudulent leads, and not to attempt to scrape, copy, or redistribute directory data.</p>

            <h2>5. Contractor Responsibilities</h2>
            <p>Contractors who create listings agree to: provide accurate business information, maintain required licenses and insurance, respond professionally to leads, and not create duplicate or fraudulent listings.</p>

            <h2>6. Payments and Subscriptions</h2>
            <p>Paid subscription plans are billed monthly or annually. Cancellations take effect at the end of the current billing period. Refunds are not provided for partial periods. We reserve the right to change pricing with 30 days' notice.</p>

            <h2>7. Reviews</h2>
            <p>Users may submit reviews of contractors. Reviews must be honest and based on genuine experience. We reserve the right to remove reviews that violate our policies. Contractors may not submit reviews of themselves or competitors.</p>

            <h2>8. Limitation of Liability</h2>
            <p>ContractorsAustin.com is not liable for any damage, loss, or injury resulting from your use of the platform or from any contractor services. Our liability is limited to the amount paid for subscription services in the 3 months preceding any claim.</p>

            <h2>9. Changes to Terms</h2>
            <p>We may update these terms periodically. Continued use of the service after changes constitutes acceptance of the new terms.</p>

            <h2>10. Contact</h2>
            <p>For terms-related questions, contact legal@contractorsaustin.com.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
