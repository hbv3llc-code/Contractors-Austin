import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  Users, Upload, Shield, BarChart3, Home, LogOut,
  Star, ChevronRight,
} from "lucide-react";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());

const navSections = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: BarChart3 },
    ],
  },
  {
    label: "Directory",
    items: [
      { href: "/admin/members", label: "Members", icon: Users },
      { href: "/admin/imports", label: "Imports", icon: Upload },
    ],
  },
  {
    label: "Moderation",
    items: [
      { href: "/admin/claims", label: "Claims", icon: Shield },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
    ],
  },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email ?? "")) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-gray-900 text-white flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-white">CA</span>
            </div>
            <span className="text-sm font-bold">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-4">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                    <ChevronRight className="h-3 w-3 ml-auto text-gray-600" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <Home className="h-4 w-4" />
            View Site
          </Link>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-8 py-4">
          <p className="text-xs text-muted-foreground">
            Signed in as <strong>{user.email}</strong>
          </p>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
