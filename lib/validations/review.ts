import { z } from "zod";

export const reviewSchema = z.object({
  contractorId: z.string().uuid(),
  reviewerName: z.string().min(2, "Name is required"),
  reviewerEmail: z.string().email("Invalid email address"),
  rating: z.number().int().min(1).max(5),
  ratingService: z.number().int().min(1).max(5).optional(),
  ratingResults: z.number().int().min(1).max(5).optional(),
  ratingExpertise: z.number().int().min(1).max(5).optional(),
  ratingCommunication: z.number().int().min(1).max(5).optional(),
  ratingResponsiveness: z.number().int().min(1).max(5).optional(),
  reviewText: z.string().min(20, "Review must be at least 20 characters"),
  projectType: z.string().optional(),
});
