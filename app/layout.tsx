import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: {
    default: "ContractorsAustin.com — Find Trusted Home Service Contractors in Austin, TX",
    template: "%s | ContractorsAustin.com",
  },
  description:
    "Find top-rated home service contractors in Austin, TX and surrounding cities. Compare verified reviews, get free quotes, and hire trusted local pros for painting, roofing, plumbing, HVAC, and more.",
  keywords: [
    "Austin contractors",
    "home services Austin TX",
    "local contractors Austin",
    "Austin home improvement",
    "find a contractor Austin",
  ],
  authors: [{ name: "ContractorsAustin.com" }],
  creator: "ContractorsAustin.com",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://contractorsaustin.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://contractorsaustin.com",
    siteName: "ContractorsAustin.com",
    title: "Find Trusted Home Service Contractors in Austin, TX",
    description:
      "Austin's top contractor directory. Find verified local pros for painting, roofing, plumbing, HVAC, electrical, landscaping, and more. Free quotes.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ContractorsAustin.com",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ContractorsAustin.com — Find Trusted Home Service Contractors",
    description: "Find top-rated local contractors in Austin, TX. Free quotes, verified reviews.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
