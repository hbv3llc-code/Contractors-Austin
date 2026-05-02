"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function VerifiedToast() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const verified = searchParams.get("verified");
    const welcome = searchParams.get("welcome");

    if (verified === "true") {
      toast({
        title: "Email verified!",
        description: "Your account is active. Complete your business setup below.",
        duration: 6000,
      });
    } else if (welcome === "true") {
      toast({
        title: "You're all set!",
        description: "Your business listing is live on ContractorsAustin.",
        duration: 6000,
      });
    }

    if (verified || welcome) {
      const url = new URL(window.location.href);
      url.searchParams.delete("verified");
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, toast]);

  return null;
}
