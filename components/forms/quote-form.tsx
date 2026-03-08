"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUDGET_OPTIONS } from "@/lib/validations/lead";
import { useToast } from "@/components/ui/use-toast";

const formSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
  budgetRange: z.string().optional(),
  projectDescription: z.string().min(20, "Please describe your project (20+ characters)"),
  preferredContactDay: z.string().optional(),
  preferredContactTime: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface QuoteFormProps {
  contractorId: string;
  contractorName: string;
}

export function QuoteForm({ contractorId, contractorName }: QuoteFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, contractorId }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message ?? "Failed to send request");
      }

      setSubmitted(true);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
      });
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-bold text-foreground mb-1">Quote Request Sent!</h3>
        <p className="text-sm text-gray-600">
          {contractorName} will be in touch shortly. Check your email for confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
      <h3 className="font-bold text-foreground mb-1">Request a Free Quote</h3>
      <p className="text-sm text-muted-foreground mb-4">from {contractorName}</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Label htmlFor="name">Your Name *</Label>
          <Input
            id="name"
            placeholder="John Smith"
            {...register("name")}
            className="mt-1"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@email.com"
            {...register("email")}
            className="mt-1"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(512) 555-0100"
            {...register("phone")}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="budgetRange">Budget Range</Label>
          <select
            id="budgetRange"
            {...register("budgetRange")}
            className="mt-1 flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select budget...</option>
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="projectDescription">Describe Your Project *</Label>
          <Textarea
            id="projectDescription"
            placeholder="Please describe what you need help with..."
            rows={3}
            {...register("projectDescription")}
            className="mt-1"
          />
          {errors.projectDescription && (
            <p className="text-xs text-red-500 mt-1">{errors.projectDescription.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="preferredContactDay" className="text-xs">Preferred Day</Label>
            <select
              id="preferredContactDay"
              {...register("preferredContactDay")}
              className="mt-1 flex h-9 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any day</option>
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="preferredContactTime" className="text-xs">Preferred Time</Label>
            <select
              id="preferredContactTime"
              {...register("preferredContactTime")}
              className="mt-1 flex h-9 w-full rounded-lg border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Any time</option>
              <option value="Morning (8am–12pm)">Morning</option>
              <option value="Afternoon (12pm–5pm)">Afternoon</option>
              <option value="Evening (5pm–8pm)">Evening</option>
            </select>
          </div>
        </div>

        <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
          <Send className="h-4 w-4" />
          {isSubmitting ? "Sending..." : "Send Free Quote Request"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          No obligation. Your info is never sold.
        </p>
      </form>
    </div>
  );
}
