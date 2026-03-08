import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, X, ArrowRight } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Pricing — List Your Business",
  description: "Choose the right plan for your contracting business. Start free, upgrade anytime. Reach Austin homeowners actively searching for your services.",
};

const plans = [
  {
    name: "Basic",
    price: { monthly: 0, annual: 0 },
    description: "Get discovered with a free listing",
    badge: null,
    highlight: false,
    features: [
      { text: "Listed in 1 service category", included: true },
      { text: "Public profile page", included: true },
      { text: "Business info & address", included: true },
      { text: "Tier 3 search placement", included: true },
      { text: "Phone number visible", included: false },
      { text: "Website link", included: false },
      { text: "Receive quote requests / leads", included: false },
      { text: "Customer reviews", included: false },
      { text: "Verified badge", included: false },
      { text: "Up to 12 project photos", included: false },
      { text: "Analytics dashboard", included: false },
    ],
    cta: "Get Started Free",
    ctaHref: "/signup",
    ctaVariant: "outline" as const,
  },
  {
    name: "Featured",
    price: { monthly: 9.99, annual: 99.99 },
    description: "More visibility and lead generation",
    badge: "Most Popular",
    highlight: true,
    features: [
      { text: "Listed in 5 service categories", included: true },
      { text: "Public profile page", included: true },
      { text: "Business info & address", included: true },
      { text: "Tier 2 search placement", included: true },
      { text: "Phone number visible", included: true },
      { text: "Website link", included: true },
      { text: "Receive quote requests / leads", included: true },
      { text: "Customer reviews", included: true },
      { text: "Verified badge", included: false },
      { text: "Up to 12 project photos", included: false },
      { text: "Analytics dashboard", included: false },
    ],
    cta: "Start Featured",
    ctaHref: "/signup?plan=featured",
    ctaVariant: "default" as const,
  },
  {
    name: "Premium",
    price: { monthly: 19.99, annual: 199.99 },
    description: "Maximum visibility and full feature set",
    badge: "Best Value",
    highlight: false,
    features: [
      { text: "Listed in 10 service categories", included: true },
      { text: "Public profile page", included: true },
      { text: "Business info & address", included: true },
      { text: "Tier 1 search placement (top results)", included: true },
      { text: "Phone number visible", included: true },
      { text: "Website & booking link", included: true },
      { text: "Receive quote requests / leads", included: true },
      { text: "Customer reviews", included: true },
      { text: "Verified badge", included: true },
      { text: "Up to 12 project photos", included: true },
      { text: "Analytics dashboard", included: true },
    ],
    cta: "Start Premium",
    ctaHref: "/signup?plan=premium",
    ctaVariant: "default" as const,
  },
];

const faqs = [
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can cancel your Featured or Premium subscription at any time from your dashboard. Your listing will revert to the Basic (free) plan at the end of your billing period.",
  },
  {
    q: "Is the Basic plan really free?",
    a: "Yes, forever. No credit card required. Your basic listing stays live as long as your account is active.",
  },
  {
    q: "What's the difference between monthly and annual?",
    a: "Annual plans save you ~17% compared to monthly billing. Featured annual is $99.99/yr vs $119.88/yr monthly. Premium annual is $199.99/yr vs $239.88/yr monthly.",
  },
  {
    q: "How do leads work?",
    a: "When a homeowner submits a quote request on your profile page, you receive an email notification with their contact info, project description, and budget. You respond directly — no platform middleman.",
  },
  {
    q: "How do I get a Verified badge?",
    a: "Verified badges are awarded to Premium plan contractors who submit their trade license and general liability insurance certificate for admin review. It typically takes 1–3 business days.",
  },
  {
    q: "Can I claim an existing listing?",
    a: "Yes. If your business is already listed as unclaimed, click 'Claim This Listing' on your profile page. You'll verify ownership via phone SMS or business email, then choose a plan.",
  },
];

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-16 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-white mb-4">Simple, Transparent Pricing</h1>
            <p className="text-blue-100 text-lg">
              Start free. Upgrade when you're ready to generate more leads.
            </p>
          </div>
        </section>

        {/* Plans */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border-2 bg-white p-8 flex flex-col ${
                    plan.highlight
                      ? "border-primary shadow-xl shadow-blue-100"
                      : "border-border shadow-sm"
                  }`}
                >
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                      {plan.badge && (
                        <Badge variant={plan.highlight ? "default" : "success"}>{plan.badge}</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground">
                        ${plan.price.monthly === 0 ? "0" : plan.price.monthly.toFixed(2)}
                      </span>
                      {plan.price.monthly > 0 && (
                        <span className="text-muted-foreground text-sm">/month</span>
                      )}
                    </div>
                    {plan.price.annual > 0 && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        or ${plan.price.annual}/year (save 17%)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature.text} className="flex items-center gap-2.5">
                        {feature.included ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted-foreground"}`}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Button variant={plan.ctaVariant} size="lg" className="w-full gap-2" asChild>
                    <Link href={plan.ctaHref}>
                      {plan.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-border p-6">
                  <h3 className="font-bold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 bg-gradient-to-r from-blue-700 to-blue-800 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to grow your business?</h2>
            <p className="text-blue-100 mb-6">
              Start with a free listing today. No credit card required.
            </p>
            <Button size="xl" variant="secondary" asChild>
              <Link href="/signup">Create Your Free Listing</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
