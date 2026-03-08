import Link from "next/link";
import { Search } from "lucide-react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-8xl font-extrabold text-gray-100 mb-4">404</div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Page Not Found</h1>
          <p className="text-gray-500 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/">Go Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/search" className="gap-2">
                <Search className="h-4 w-4" />
                Find Contractors
              </Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
