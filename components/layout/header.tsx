"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-white">CA</span>
            </div>
            <span className="hidden text-lg font-bold text-foreground sm:block">
              ContractorsAustin
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              How It Works
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary transition-colors">
                Find Pros
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <div className="absolute left-0 top-full mt-2 w-56 rounded-xl border border-border bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="p-2">
                  {[
                    { label: "Painters", href: "/painters" },
                    { label: "Roofers", href: "/roofers" },
                    { label: "Plumbers", href: "/plumbers" },
                    { label: "HVAC / AC Repair", href: "/hvac" },
                    { label: "Electricians", href: "/electricians" },
                    { label: "Handyman", href: "/handyman" },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <Link
                    href="/"
                    className="block rounded-lg px-3 py-2 text-sm font-medium text-primary hover:bg-blue-50 transition-colors"
                  >
                    Browse All Categories →
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/get-quotes"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              Get Free Quotes
            </Link>
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Button asChild size="sm">
              <Link href="/pricing">List Your Business</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <Link
              href="/how-it-works"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Find Pros
            </Link>
            <Link
              href="/get-quotes"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setMobileOpen(false)}
            >
              Get Free Quotes
            </Link>
            <div className="pt-2 border-t border-border mt-2">
              <Link
                href="/login"
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/pricing"
                className="mt-1 block rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark text-center"
                onClick={() => setMobileOpen(false)}
              >
                List Your Business
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
