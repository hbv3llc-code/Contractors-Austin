"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

export function VerifiedToast() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast({
        title: "Email verified!",
        description: "Your account is active. Welcome to ContractorsAustin!",
        duration: 6000,
      });
      // Remove the param from the URL without a page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("verified");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams, toast]);

  return null;
}
