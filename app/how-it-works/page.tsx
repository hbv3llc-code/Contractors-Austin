import type { Metadata } from "next";
import Link from "next/link";
import { Search, Star, CheckCircle, Shield, Clock, ArrowRight } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "How It Works",
  description: "Learn how ContractorsAustin.com connects Austin homeowners with trusted local contractors. Find, compare, and hire in minutes.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-700 to-blue-900 py-20 text-center">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-extrabold text-white mb-4">How ContractorsAustin Works</h1>
            <p className="text-blue-100 text-xl max-w-2xl mx-auto">
              Connecting Austin homeowners with trusted local contractors — fast, free, and easy.
            </p>
          </div>
        </section>

        {/* For Homeowners */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground text-center mb-12">For Homeowners</h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  icon: Search,
                  title: "Search Your Service",
                  description: "Choose from 20+ home service categories. Filter by city, rating, and availability. See verified pros in your area instantly.",
                },
                {
                  step: "2",
                  icon: Star,
                  title: "Compare Contractors",
                  description: "Read real reviews from Austin homeowners. View project photos, credentials, years in business, and response times.",
                },
                {
                  step: "3",
                  icon: CheckCircle,
                  title: "Get Free Quotes",
                  description: "Request quotes from multiple contractors at once. No obligation, no hidden fees. You pick who to hire.",
                },
              ].map(({ step, icon: Icon, title, description }) => (
                <div key={step} className="text-center p-6 rounded-2xl bg-gray-50">
                  <div className="relative inline-flex mb-4">
                    <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center">
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-blue-100 border-2 border-primary text-primary text-xs font-bold flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button size="lg" asChild>
                <Link href="/search">
                  Find Contractors Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* For Contractors */}
        <section className="py-16 bg-gray-50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground text-center mb-4">For Contractors</h2>
            <p className="text-center text-gray-500 mb-12">
              Grow your business with a professional directory listing that reaches Austin homeowners
              actively looking for your services.
            </p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: "🆓", title: "Start Free", desc: "Create your basic listing at no cost. No credit card required." },
                { icon: "📋", title: "Build Your Profile", desc: "Add photos, credentials, service areas, and a detailed bio." },
                { icon: "📩", title: "Receive Leads", desc: "Upgrade to Featured or Premium and start receiving quote requests directly." },
                { icon: "⭐", title: "Grow Reviews", desc: "Collect reviews from happy customers and climb the search rankings." },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-white border border-border p-5 text-center shadow-sm">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Button size="lg" asChild>
                <Link href="/pricing">
                  View Pricing Plans <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Trust signals */}
        <section className="py-12 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
              {[
                { icon: Shield, title: "Verified Professionals", desc: "We display verified and claimed contractor badges so you know who you're dealing with." },
                { icon: Star, title: "Real Reviews", desc: "All reviews are from real homeowners who submitted quote requests through our platform." },
                { icon: Clock, title: "Fast Response", desc: "Most Premium contractors respond to quote requests within 24 hours." },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6">
                  <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
