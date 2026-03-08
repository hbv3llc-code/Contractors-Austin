export const revalidate = 300;

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Phone, Globe, Shield, CheckCircle, Clock, Star,
  Calendar, Award, ChevronRight, ExternalLink, AlertCircle,
} from "lucide-react";
import type { Metadata } from "next";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { QuoteForm } from "@/components/forms/quote-form";
import { prisma } from "@/lib/prisma";
import { formatPhone } from "@/lib/utils";

interface ContractorProfilePageProps {
  params: { slug: string };
}

async function getContractor(slug: string) {
  try {
    return await prisma.contractor.findUnique({
      where: { slug },
      include: {
        services: { include: { service: true } },
        locations: { include: { location: true } },
        reviews: {
          where: { status: "approved" },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        membership: true,
        photos: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ContractorProfilePageProps): Promise<Metadata> {
  const contractor = await getContractor(params.slug);
  if (!contractor) return { title: "Contractor Not Found" };

  const primaryService = contractor.services.find((s) => s.isPrimary)?.service;
  const title = `${contractor.name} — ${primaryService?.name ?? "Contractor"} in ${contractor.city ?? "Austin"}, TX`;
  const description = `${contractor.name} is a ${primaryService?.name?.toLowerCase() ?? "contractor"} in ${contractor.city ?? "Austin"}, TX${contractor.reviewCount > 0 ? ` with ${contractor.reviewCount} reviews` : ""}${contractor.rating ? ` and a ${contractor.rating.toFixed(1)}-star rating` : ""}. Request a free quote today.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export async function generateStaticParams() {
  try {
    const contractors = await prisma.contractor.findMany({
      select: { slug: true },
      where: { verifiedStatus: { not: "unclaimed" } },
    });
    return contractors.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

export default async function ContractorProfilePage({ params }: ContractorProfilePageProps) {
  const contractor = await getContractor(params.slug);
  if (!contractor) notFound();

  const isPremium = contractor.membership?.planType === "premium";
  const isFeatured = contractor.membership?.planType === "featured";
  const isVerified = contractor.verifiedStatus === "verified";
  const isClaimed = contractor.verifiedStatus === "claimed" || isVerified;
  const isUnclaimed = contractor.verifiedStatus === "unclaimed";
  const primaryService = contractor.services.find((s) => s.isPrimary)?.service;
  const allServices = contractor.services.map((cs) => cs.service);
  const locations = contractor.locations.map((cl) => cl.location);

  const hours = contractor.hours as Record<string, { open: string; close: string } | null> | null;
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayKeys = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: contractor.name,
    description: contractor.description,
    telephone: contractor.phone ? formatPhone(contractor.phone) : undefined,
    url: contractor.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: contractor.address,
      addressLocality: contractor.city,
      addressRegion: contractor.state ?? "TX",
      postalCode: contractor.zip,
      addressCountry: "US",
    },
    ...(contractor.lat && contractor.lng && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: contractor.lat,
        longitude: contractor.lng,
      },
    }),
    ...(contractor.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: contractor.rating,
        reviewCount: contractor.reviewCount,
      },
    }),
  };

  return (
    <>
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="min-h-screen bg-gray-50">
        {/* Unclaimed Banner */}
        {isUnclaimed && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>
                  <strong>Is this your business?</strong> Claim this listing to respond to reviews,
                  update your info, and start receiving leads.
                </span>
              </div>
              <Button asChild size="sm" variant="warning">
                <Link href={`/claim/${contractor.id}`}>Claim This Listing →</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-border py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary">Home</Link></li>
              <ChevronRight className="h-3.5 w-3.5" />
              {primaryService && (
                <>
                  <li>
                    <Link href={`/${primaryService.slug}`} className="hover:text-primary">
                      {primaryService.name}
                    </Link>
                  </li>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              {contractor.city && (
                <>
                  <li className="text-foreground font-medium">{contractor.city}, TX</li>
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
              <li className="text-foreground font-medium truncate max-w-[200px]">
                {contractor.name}
              </li>
            </ol>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Profile Header Card */}
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="h-24 w-24 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {contractor.name.charAt(0)}
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start gap-2 mb-2">
                      <h1 className="text-2xl font-bold text-foreground">{contractor.name}</h1>
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
                      <p className="text-gray-500 mb-2">{primaryService.name}</p>
                    )}

                    {contractor.rating && contractor.reviewCount > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <StarRating rating={contractor.rating} showValue />
                        <span className="text-sm text-muted-foreground">
                          ({contractor.reviewCount} reviews)
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {contractor.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          {contractor.city}, TX
                        </div>
                      )}
                      {contractor.yearsInBusiness && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {contractor.yearsInBusiness}+ years in business
                        </div>
                      )}
                      {contractor.insuranceVerified && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Shield className="h-4 w-4" />
                          Licensed & Insured
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                    {!isUnclaimed && (
                      <Button size="lg" asChild>
                        <Link href="#quote-form">Get Free Quote</Link>
                      </Button>
                    )}
                    {contractor.phone && (isFeatured || isPremium) && !isUnclaimed && (
                      <a
                        href={`tel:${contractor.phone}`}
                        className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-gray-50 transition-colors"
                      >
                        <Phone className="h-4 w-4" />
                        {formatPhone(contractor.phone)}
                      </a>
                    )}
                    {contractor.website && isPremium && (
                      <a
                        href={contractor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* About */}
              {contractor.description && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4">About {contractor.name}</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {contractor.description}
                  </p>
                </div>
              )}

              {/* Services */}
              {allServices.length > 0 && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4">Services Offered</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {allServices.map((svc) => (
                      <div key={svc.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                        <span className="text-sm font-medium text-foreground">{svc.name}</span>
                        {!isUnclaimed && (
                          <Button size="sm" variant="outline" asChild>
                            <Link href="#quote-form">Request Info</Link>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photos */}
              {contractor.photos.length > 0 && (
                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-foreground mb-4">Project Photos</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {contractor.photos.map((photo) => (
                      <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img
                          src={photo.url}
                          alt={photo.caption ?? `${contractor.name} project photo`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-foreground">
                    Customer Reviews
                    {contractor.reviewCount > 0 && (
                      <span className="ml-2 text-base font-normal text-muted-foreground">
                        ({contractor.reviewCount})
                      </span>
                    )}
                  </h2>
                  {isClaimed && (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/contractor/${contractor.slug}/review`}>Write a Review</Link>
                    </Button>
                  )}
                </div>

                {contractor.reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-muted-foreground">No reviews yet.</p>
                    {isClaimed && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Be the first to review {contractor.name}.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contractor.reviews.map((review) => (
                      <div key={review.id} className="rounded-xl bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-sm font-semibold text-foreground">
                                {review.reviewerName}
                              </span>
                            </div>
                            {review.projectType && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {review.projectType}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{review.reviewText}</p>

                        {/* Dimension ratings */}
                        {(review.ratingService ?? review.ratingCommunication) && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              { label: "Service", value: review.ratingService },
                              { label: "Results", value: review.ratingResults },
                              { label: "Expertise", value: review.ratingExpertise },
                              { label: "Communication", value: review.ratingCommunication },
                              { label: "Responsiveness", value: review.ratingResponsiveness },
                            ]
                              .filter((d) => d.value)
                              .map((d) => (
                                <div key={d.label} className="flex items-center gap-1.5">
                                  <span className="text-xs text-muted-foreground">{d.label}:</span>
                                  <StarRating rating={d.value!} size="sm" />
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:w-80 flex-shrink-0 space-y-4">
              {/* Quote Form or Claim CTA */}
              {isUnclaimed ? (
                <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-foreground mb-2">Want leads from this area?</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    This business hasn't claimed their listing yet. Find a verified contractor in this
                    area instead.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/search">Search Verified Contractors</Link>
                  </Button>
                </div>
              ) : (
                <div id="quote-form">
                  <QuoteForm contractorId={contractor.id} contractorName={contractor.name} />
                </div>
              )}

              {/* Business Details */}
              <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-foreground mb-3">Business Details</h3>
                <dl className="space-y-2.5 text-sm">
                  {contractor.yearsInBusiness && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Year Established</dt>
                      <dd className="font-medium">
                        {new Date().getFullYear() - contractor.yearsInBusiness}
                      </dd>
                    </div>
                  )}
                  {contractor.licenseNumber && (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">License #</dt>
                      <dd className="font-medium">{contractor.licenseNumber}</dd>
                    </div>
                  )}
                  {contractor.insuranceVerified && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <Shield className="h-4 w-4" />
                      <span>Licensed & Insured</span>
                    </div>
                  )}
                  {contractor.responseTimeLabel && (
                    <div className="flex items-center gap-1.5 text-green-600">
                      <Clock className="h-4 w-4" />
                      <span>{contractor.responseTimeLabel}</span>
                    </div>
                  )}
                </dl>
              </div>

              {/* Hours */}
              {hours && (
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-3">Hours of Operation</h3>
                  <dl className="space-y-1.5 text-sm">
                    {dayKeys.map((key, i) => {
                      const dayHours = hours[key];
                      return (
                        <div key={key} className="flex justify-between">
                          <dt className="text-muted-foreground w-24">{dayNames[i]}</dt>
                          <dd className="font-medium text-right">
                            {dayHours ? (
                              `${dayHours.open} – ${dayHours.close}`
                            ) : (
                              <span className="text-muted-foreground">Closed</span>
                            )}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>
              )}

              {/* Service Areas */}
              {locations.length > 0 && (
                <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                  <h3 className="font-semibold text-foreground mb-3">Service Areas</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {locations.map((loc) => (
                      <Link
                        key={loc.id}
                        href={`/${loc.slug}-contractors`}
                        className="rounded-full border border-border px-3 py-1 text-xs text-gray-600 hover:border-primary hover:text-primary transition-colors"
                      >
                        {loc.name}, TX
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Upgrade CTA for Basic */}
              {contractor.membership?.planType === "basic" && isClaimed && (
                <div className="rounded-xl bg-blue-50 border border-blue-200 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">Upgrade for More Leads</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Get your phone number visible, receive quote requests, and jump to the top of search results.
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link href="/pricing">See Upgrade Options</Link>
                  </Button>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
