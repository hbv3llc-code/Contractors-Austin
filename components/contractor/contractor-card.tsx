import Link from "next/link";
import { MapPin, Phone, Globe, Shield, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { formatPhone } from "@/lib/utils";
import type { Prisma } from "@prisma/client";

type ContractorWithRelations = Prisma.ContractorGetPayload<{
  include: {
    services: { include: { service: true } };
    membership: true;
  };
}>;

interface ContractorCardProps {
  contractor: ContractorWithRelations;
  showPhone?: boolean;
}

export function ContractorCard({ contractor, showPhone = false }: ContractorCardProps) {
  const isPremium = contractor.membership?.planType === "premium";
  const isFeatured = contractor.membership?.planType === "featured";
  const isVerified = contractor.verifiedStatus === "verified";
  const isUnclaimed = contractor.verifiedStatus === "unclaimed";
  const primaryService = contractor.services.find((s) => s.isPrimary)?.service;

  return (
    <div className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
      {/* Photo */}
      <div className="flex-shrink-0">
        <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
          <span className="text-2xl font-bold text-primary">
            {contractor.name.charAt(0)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <Link
            href={`/contractor/${contractor.slug}`}
            className="text-base font-bold text-foreground hover:text-primary transition-colors"
          >
            {contractor.name}
          </Link>
          {isPremium && (
            <Badge variant="premium" className="gap-1">
              <CheckCircle className="h-3 w-3" />
              Premium
            </Badge>
          )}
          {isFeatured && !isPremium && (
            <Badge variant="featured">Featured</Badge>
          )}
          {isVerified && (
            <Badge variant="success" className="gap-1">
              <Shield className="h-3 w-3" />
              Verified
            </Badge>
          )}
          {isUnclaimed && (
            <Badge variant="warning">Unclaimed</Badge>
          )}
        </div>

        {primaryService && (
          <p className="text-sm text-muted-foreground mb-1">{primaryService.name}</p>
        )}

        {/* Rating */}
        {contractor.rating && contractor.reviewCount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={contractor.rating} size="sm" />
            <span className="text-sm font-semibold text-foreground">{contractor.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({contractor.reviewCount} reviews)</span>
          </div>
        )}

        {/* Location */}
        {contractor.city && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              {contractor.city}, TX
              {contractor.yearsInBusiness && ` · ${contractor.yearsInBusiness}+ years in business`}
            </span>
          </div>
        )}

        {/* Response info */}
        {contractor.responseTimeLabel && (
          <div className="flex items-center gap-1 text-sm text-green-600 mb-2">
            <Clock className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{contractor.responseTimeLabel}</span>
          </div>
        )}

        {/* Description */}
        {contractor.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {contractor.description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-end gap-2 flex-shrink-0">
        <Button asChild size="sm">
          <Link href={`/contractor/${contractor.slug}`}>View Profile</Link>
        </Button>
        {showPhone && contractor.phone && (isFeatured || isPremium) ? (
          <a
            href={`tel:${contractor.phone}`}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
          >
            <Phone className="h-4 w-4" />
            {formatPhone(contractor.phone)}
          </a>
        ) : null}
        {contractor.website && isPremium && (
          <a
            href={contractor.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <Globe className="h-3.5 w-3.5" />
            Website
          </a>
        )}
      </div>
    </div>
  );
}
