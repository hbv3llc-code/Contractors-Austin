import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "ContractorsAustin.com privacy policy — how we collect, use, and protect your information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-border py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-gray-500 mt-2">Last updated: March 2026</p>
          </div>
        </div>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-xl border border-border bg-white p-8 shadow-sm prose prose-gray max-w-none">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including when you create an account, list your business, submit a quote request, or contact us. This may include your name, email address, phone number, business information, and payment information.</p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send notifications about leads and account activity, and communicate with you about our services.</p>

            <h2>3. Information Sharing</h2>
            <p>We do not sell your personal information to third parties. We may share your information with contractors when you submit a quote request, with service providers who assist our operations (such as Stripe for payment processing), and as required by law.</p>

            <h2>4. Contractor Listings</h2>
            <p>Business information displayed on contractor profiles (name, service area, phone number for paid plans, website) is publicly visible. Unclaimed listings display publicly available information collected from public sources. Contractors may claim and update their listings at any time.</p>

            <h2>5. Data Security</h2>
            <p>We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. Payment information is processed by Stripe and never stored on our servers.</p>

            <h2>6. Cookies</h2>
            <p>We use cookies and similar technologies to authenticate users, remember preferences, and analyze site traffic. You may disable cookies in your browser settings, though some features may not function properly.</p>

            <h2>7. Your Rights</h2>
            <p>You may access, update, or delete your account information at any time through your dashboard. To request deletion of your data, contact us at privacy@contractorsaustin.com.</p>

            <h2>8. Contact</h2>
            <p>For privacy questions or requests, contact us at privacy@contractorsaustin.com or through our Contact Us page.</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
