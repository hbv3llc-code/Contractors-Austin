"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { Star, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const schema = z.object({
  reviewerName: z.string().min(2, "Name is required"),
  reviewerEmail: z.string().email("Invalid email"),
  rating: z.number().min(1).max(5),
  ratingService: z.number().min(1).max(5).optional(),
  ratingResults: z.number().min(1).max(5).optional(),
  ratingExpertise: z.number().min(1).max(5).optional(),
  ratingCommunication: z.number().min(1).max(5).optional(),
  ratingResponsiveness: z.number().min(1).max(5).optional(),
  reviewText: z.string().min(20, "Review must be at least 20 characters"),
  projectType: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ReviewFormProps {
  contractorId: string;
  contractorSlug: string;
}

function StarSelector({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-36">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= (hovered || value) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export function ReviewForm({ contractorId, contractorSlug }: ReviewFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0 },
  });

  const rating = watch("rating");

  async function onSubmit(data: FormData) {
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, contractorId }),
      });

      if (!res.ok) throw new Error("Failed to submit review");

      setSubmitted(true);
    } catch {
      toast({ variant: "destructive", title: "Error", description: "Failed to submit review. Please try again." });
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-foreground mb-2">Review Submitted!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for your review. It will be visible on the profile after moderation (usually within 24 hours).
        </p>
        <Button onClick={() => router.push(`/contractor/${contractorSlug}`)}>
          Back to Profile
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-xl border border-border bg-white p-6 shadow-sm space-y-5">
      {/* Overall rating */}
      <div>
        <Label className="text-base">Overall Rating *</Label>
        <div className="mt-2">
          <StarSelector value={rating} onChange={(v) => setValue("rating", v)} label="Overall" />
          {errors.rating && <p className="text-xs text-red-500 mt-1">Please select a rating</p>}
        </div>
      </div>

      {/* Dimension ratings */}
      <div>
        <Label className="text-base">Detailed Ratings (optional)</Label>
        <div className="mt-2 space-y-2">
          {[
            { key: "ratingService", label: "Service" },
            { key: "ratingResults", label: "Results" },
            { key: "ratingExpertise", label: "Expertise" },
            { key: "ratingCommunication", label: "Communication" },
            { key: "ratingResponsiveness", label: "Responsiveness" },
          ].map(({ key, label }) => {
            const val = watch(key as keyof FormData) as number ?? 0;
            return (
              <StarSelector
                key={key}
                value={val}
                onChange={(v) => setValue(key as keyof FormData, v)}
                label={label}
              />
            );
          })}
        </div>
      </div>

      {/* Project type */}
      <div>
        <Label htmlFor="projectType">Project Type</Label>
        <Input
          id="projectType"
          {...register("projectType")}
          placeholder="e.g. Exterior House Painting"
          className="mt-1"
        />
      </div>

      {/* Review text */}
      <div>
        <Label htmlFor="reviewText">Your Review *</Label>
        <Textarea
          id="reviewText"
          {...register("reviewText")}
          rows={5}
          placeholder="Describe your experience — quality of work, professionalism, communication, and whether you'd recommend them..."
          className="mt-1"
        />
        {errors.reviewText && (
          <p className="text-xs text-red-500 mt-1">{errors.reviewText.message}</p>
        )}
      </div>

      {/* Reviewer info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reviewerName">Your Name *</Label>
          <Input id="reviewerName" {...register("reviewerName")} placeholder="Jane S." className="mt-1" />
          {errors.reviewerName && (
            <p className="text-xs text-red-500 mt-1">{errors.reviewerName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="reviewerEmail">Email Address *</Label>
          <Input id="reviewerEmail" type="email" {...register("reviewerEmail")} placeholder="jane@email.com" className="mt-1" />
          {errors.reviewerEmail && (
            <p className="text-xs text-red-500 mt-1">{errors.reviewerEmail.message}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">Not displayed publicly</p>
        </div>
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Reviews are moderated and typically approved within 24 hours.
      </p>
    </form>
  );
}
