import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import SignupForm from "./signup-form";

export const metadata: Metadata = { title: "Create Your Free Listing" };

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Suspense fallback={<div className="rounded-2xl border border-border bg-white p-8 shadow-sm h-96 animate-pulse" />}>
            <SignupForm />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
