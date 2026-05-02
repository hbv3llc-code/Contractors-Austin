import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { LayoutDashboard, User, Inbox, CreditCard, Settings, LogOut, BarChart2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { VerifiedToast } from "@/components/dashboard/verified-toast";

function isOnboardingComplete(contractor: {
  ownerName: string | null;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  services: { id: string }[];
} | null): boolean {
  if (!contractor) return false;
  return !!(
    contractor.ownerName &&
    contractor.name &&
    contractor.address &&
    contractor.city &&
    contractor.phone &&
    contractor.email &&
    contractor.services.length > 0
  );
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Listing", href: "/dashboard/listing", icon: User },
  { label: "Leads", href: "/dashboard/leads", icon: Inbox },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let contractor = null;
  try {
    contractor = await prisma.contractor.findFirst({
      where: { OR: [{ userId: user.id }, { email: user.email! }] },
      select: {
        ownerName: true, name: true, address: true,
        city: true, phone: true, email: true,
        services: { select: { id: true } },
      },
    });
  } catch {}

  if (!isOnboardingComplete(contractor)) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-white">CA</span>
            </div>
            <span className="font-bold text-foreground text-sm">ContractorsAustin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <nav className="rounded-xl border border-border bg-white p-3 shadow-sm space-y-0.5">
              {navItems.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-foreground transition-colors"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <Suspense>
              <VerifiedToast />
            </Suspense>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
