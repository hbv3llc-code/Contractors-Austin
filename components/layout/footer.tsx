import Link from "next/link";

const services = [
  { label: "Painters", href: "/painters" },
  { label: "Roofers", href: "/roofers" },
  { label: "Plumbers", href: "/plumbers" },
  { label: "HVAC / AC Repair", href: "/hvac" },
  { label: "Electricians", href: "/electricians" },
  { label: "Handyman Services", href: "/handyman" },
  { label: "Landscapers", href: "/landscapers" },
  { label: "General Contractors", href: "/general-contractors" },
];

const cities = [
  { label: "Austin", href: "/austin-contractors" },
  { label: "Round Rock", href: "/round-rock-contractors" },
  { label: "Cedar Park", href: "/cedar-park-contractors" },
  { label: "Georgetown", href: "/georgetown-contractors" },
  { label: "Kyle", href: "/kyle-contractors" },
  { label: "Pflugerville", href: "/pflugerville-contractors" },
  { label: "Leander", href: "/leander-contractors" },
  { label: "San Marcos", href: "/san-marcos-contractors" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-white">CA</span>
              </div>
              <span className="text-base font-bold text-white">ContractorsAustin</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Austin's trusted home services contractor directory. Find verified pros, read real
              reviews, and get free quotes from local contractors.
            </p>
            <div className="mt-4 text-xs text-gray-500">
              Serving Austin & surrounding cities · Est. 2026
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
              Find Pros
            </h3>
            <ul className="space-y-2">
              {services.map((s) => (
                <li key={s.href}>
                  <Link
                    href={s.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
              Service Areas
            </h3>
            <ul className="space-y-2">
              {cities.map((c) => (
                <li key={c.href}>
                  <Link
                    href={c.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/guides" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Guides & Tips
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Project Gallery
                </Link>
              </li>
              <li>
                <Link href="/locations" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Service Areas
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-sm text-gray-400 hover:text-white transition-colors">
                  All Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-white uppercase tracking-wider">
              Professionals
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                  List Your Business
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contractor Login
                </Link>
              </li>
            </ul>
            <h3 className="mt-6 mb-4 text-sm font-semibold text-white uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} ContractorsAustin.com. All rights reserved.
          </p>
          <p className="text-xs text-gray-500">
            Austin, TX · Cedar Park · Round Rock · Georgetown · Kyle · Buda · San Marcos · Leander
          </p>
        </div>
      </div>
    </footer>
  );
}
