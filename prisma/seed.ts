import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  // Group A — Launch Public (20)
  { name: "Painters", slug: "painters", isPublic: true, sortOrder: 1 },
  { name: "Roofers", slug: "roofers", isPublic: true, sortOrder: 2 },
  { name: "Plumbers", slug: "plumbers", isPublic: true, sortOrder: 3 },
  { name: "HVAC / AC Repair", slug: "hvac", isPublic: true, sortOrder: 4 },
  { name: "Electricians", slug: "electricians", isPublic: true, sortOrder: 5 },
  { name: "General Contractors", slug: "general-contractors", isPublic: true, sortOrder: 6 },
  { name: "Handyman Services", slug: "handyman", isPublic: true, sortOrder: 7 },
  { name: "Landscapers", slug: "landscapers", isPublic: true, sortOrder: 8 },
  { name: "Deck Builders", slug: "deck-builders", isPublic: true, sortOrder: 9 },
  { name: "Flooring", slug: "flooring", isPublic: true, sortOrder: 10 },
  { name: "Windows & Doors", slug: "windows-doors", isPublic: true, sortOrder: 11 },
  { name: "Pool Services", slug: "pool-services", isPublic: true, sortOrder: 12 },
  { name: "Cleaners", slug: "cleaners", isPublic: true, sortOrder: 13 },
  { name: "Pest Control", slug: "pest-control", isPublic: true, sortOrder: 14 },
  { name: "Garage Doors", slug: "garage-doors", isPublic: true, sortOrder: 15 },
  { name: "Foundation Repair", slug: "foundation-repair", isPublic: true, sortOrder: 16 },
  { name: "Home Inspectors", slug: "home-inspectors", isPublic: true, sortOrder: 17 },
  { name: "Security Systems", slug: "security-systems", isPublic: true, sortOrder: 18 },
  { name: "Fencing", slug: "fencing", isPublic: true, sortOrder: 19 },
  { name: "Concrete & Masonry", slug: "concrete-masonry", isPublic: true, sortOrder: 20 },
  // Group B — Pre-seeded, activate when ready (30)
  { name: "Tree Services", slug: "tree-services", isPublic: false, sortOrder: 21 },
  { name: "Appliance Repair", slug: "appliance-repair", isPublic: false, sortOrder: 22 },
  { name: "Drywall", slug: "drywall", isPublic: false, sortOrder: 23 },
  { name: "Tile & Grout", slug: "tile-grout", isPublic: false, sortOrder: 24 },
  { name: "Waterproofing", slug: "waterproofing", isPublic: false, sortOrder: 25 },
  { name: "Solar Panels", slug: "solar-panels", isPublic: false, sortOrder: 26 },
  { name: "Insulation", slug: "insulation", isPublic: false, sortOrder: 27 },
  { name: "Cabinet Install", slug: "cabinet-install", isPublic: false, sortOrder: 28 },
  { name: "Countertops", slug: "countertops", isPublic: false, sortOrder: 29 },
  { name: "Sprinkler Systems", slug: "sprinkler-systems", isPublic: false, sortOrder: 30 },
  { name: "Chimney Sweep", slug: "chimney-sweep", isPublic: false, sortOrder: 31 },
  { name: "Moving Services", slug: "movers", isPublic: false, sortOrder: 32 },
  { name: "Junk Removal", slug: "junk-removal", isPublic: false, sortOrder: 33 },
  { name: "EV Charger Install", slug: "ev-charger", isPublic: false, sortOrder: 34 },
  { name: "Asphalt & Paving", slug: "paving", isPublic: false, sortOrder: 35 },
  { name: "Siding", slug: "siding", isPublic: false, sortOrder: 36 },
  { name: "Gutters", slug: "gutters", isPublic: false, sortOrder: 37 },
  { name: "Pressure Washing", slug: "pressure-washing", isPublic: false, sortOrder: 38 },
  { name: "Glass & Mirrors", slug: "glass-mirrors", isPublic: false, sortOrder: 39 },
  { name: "Wallpaper", slug: "wallpaper", isPublic: false, sortOrder: 40 },
  { name: "Blinds & Shutters", slug: "blinds-shutters", isPublic: false, sortOrder: 41 },
  { name: "Smart Home", slug: "smart-home", isPublic: false, sortOrder: 42 },
  { name: "Generator Install", slug: "generators", isPublic: false, sortOrder: 43 },
  { name: "Septic Systems", slug: "septic", isPublic: false, sortOrder: 44 },
  { name: "Well Services", slug: "well-services", isPublic: false, sortOrder: 45 },
  { name: "Storm Damage Repair", slug: "storm-damage", isPublic: false, sortOrder: 46 },
  { name: "Fire & Water Restoration", slug: "restoration", isPublic: false, sortOrder: 47 },
  { name: "Interior Design", slug: "interior-design", isPublic: false, sortOrder: 48 },
  { name: "Locksmith", slug: "locksmith", isPublic: false, sortOrder: 49 },
  { name: "Holiday Lighting", slug: "holiday-lighting", isPublic: false, sortOrder: 50 },
];

const locations = [
  { name: "Austin", slug: "austin", lat: 30.2672, lng: -97.7431 },
  { name: "Cedar Park", slug: "cedar-park", lat: 30.5052, lng: -97.8203 },
  { name: "Round Rock", slug: "round-rock", lat: 30.5083, lng: -97.6789 },
  { name: "Pflugerville", slug: "pflugerville", lat: 30.4394, lng: -97.6200 },
  { name: "Georgetown", slug: "georgetown", lat: 30.6333, lng: -97.6775 },
  { name: "Kyle", slug: "kyle", lat: 29.9891, lng: -97.8772 },
  { name: "Buda", slug: "buda", lat: 30.0849, lng: -97.8408 },
  { name: "San Marcos", slug: "san-marcos", lat: 29.8827, lng: -97.9411 },
  { name: "Leander", slug: "leander", lat: 30.5788, lng: -97.8531 },
  { name: "Hutto", slug: "hutto", lat: 30.5427, lng: -97.5461 },
  { name: "Bastrop", slug: "bastrop", lat: 30.1105, lng: -97.3153 },
  { name: "Dripping Springs", slug: "dripping-springs", lat: 30.1902, lng: -98.0867 },
  { name: "Bee Cave", slug: "bee-cave", lat: 30.3079, lng: -97.9544 },
];

// Sample contractors for development
const sampleContractors = [
  {
    name: "Austin Precision Painting",
    slug: "austin-precision-painting",
    description:
      "Austin Precision Painting has been serving the Austin metro area for over 15 years. We specialize in interior and exterior residential and commercial painting, delivering flawless results every time. Our team of experienced painters uses premium paints and precise techniques to transform your space.",
    phone: "5125550101",
    email: "info@austinprecisionpainting.com",
    website: "https://austinprecisionpainting.com",
    yearsInBusiness: 15,
    insuranceVerified: true,
    verifiedStatus: "verified" as const,
    listingSource: "self_registered" as const,
    rating: 4.8,
    reviewCount: 47,
    profileCompleteness: 100,
    hours: {
      mon: { open: "08:00", close: "17:00" },
      tue: { open: "08:00", close: "17:00" },
      wed: { open: "08:00", close: "17:00" },
      thu: { open: "08:00", close: "17:00" },
      fri: { open: "08:00", close: "17:00" },
      sat: { open: "09:00", close: "14:00" },
      sun: null,
    },
    lat: 30.2672,
    lng: -97.7431,
    address: "1234 South Lamar Blvd",
    city: "Austin",
    state: "TX",
    zip: "78704",
    serviceSlug: "painters",
    planType: "premium" as const,
  },
  {
    name: "Capital City Roofing",
    slug: "capital-city-roofing",
    description:
      "Capital City Roofing is your trusted roofing contractor in Austin, TX. We handle everything from minor repairs to complete roof replacements. Licensed, bonded, and insured. We work with all major insurance companies for storm damage claims.",
    phone: "5125550202",
    email: "info@capitalcityroofing.com",
    website: "https://capitalcityroofing.com",
    yearsInBusiness: 12,
    insuranceVerified: true,
    verifiedStatus: "verified" as const,
    listingSource: "self_registered" as const,
    rating: 4.6,
    reviewCount: 83,
    profileCompleteness: 95,
    hours: {
      mon: { open: "07:00", close: "18:00" },
      tue: { open: "07:00", close: "18:00" },
      wed: { open: "07:00", close: "18:00" },
      thu: { open: "07:00", close: "18:00" },
      fri: { open: "07:00", close: "18:00" },
      sat: { open: "08:00", close: "15:00" },
      sun: null,
    },
    lat: 30.5083,
    lng: -97.6789,
    address: "567 Round Rock Ave",
    city: "Round Rock",
    state: "TX",
    zip: "78664",
    serviceSlug: "roofers",
    planType: "premium" as const,
  },
  {
    name: "Hill Country Plumbing",
    slug: "hill-country-plumbing",
    description:
      "Hill Country Plumbing provides fast, reliable plumbing services across the Austin metro area. Available 24/7 for emergencies. From water heater installation to full bathroom remodels, our licensed plumbers handle it all with transparency and fair pricing.",
    phone: "5125550303",
    email: "service@hillcountryplumbing.com",
    website: "https://hillcountryplumbing.com",
    yearsInBusiness: 8,
    insuranceVerified: true,
    verifiedStatus: "claimed" as const,
    listingSource: "self_registered" as const,
    rating: 4.7,
    reviewCount: 31,
    profileCompleteness: 88,
    hours: {
      mon: { open: "00:00", close: "23:59" },
      tue: { open: "00:00", close: "23:59" },
      wed: { open: "00:00", close: "23:59" },
      thu: { open: "00:00", close: "23:59" },
      fri: { open: "00:00", close: "23:59" },
      sat: { open: "00:00", close: "23:59" },
      sun: { open: "00:00", close: "23:59" },
    },
    lat: 30.5052,
    lng: -97.8203,
    address: "890 Cedar Park Blvd",
    city: "Cedar Park",
    state: "TX",
    zip: "78613",
    serviceSlug: "plumbers",
    planType: "featured" as const,
  },
  {
    name: "Texas Cool HVAC",
    slug: "texas-cool-hvac",
    description:
      "Texas Cool HVAC keeps Austin homes comfortable year-round. We service, repair, and install all major HVAC brands. Energy-efficient upgrades, AC tune-ups, and emergency repairs. NATE-certified technicians with same-day availability.",
    phone: "5125550404",
    email: "cool@texascoolhvac.com",
    website: "https://texascoolhvac.com",
    yearsInBusiness: 10,
    insuranceVerified: true,
    verifiedStatus: "verified" as const,
    listingSource: "self_registered" as const,
    rating: 4.9,
    reviewCount: 124,
    profileCompleteness: 100,
    hours: {
      mon: { open: "07:00", close: "20:00" },
      tue: { open: "07:00", close: "20:00" },
      wed: { open: "07:00", close: "20:00" },
      thu: { open: "07:00", close: "20:00" },
      fri: { open: "07:00", close: "20:00" },
      sat: { open: "08:00", close: "17:00" },
      sun: { open: "10:00", close: "16:00" },
    },
    lat: 30.2672,
    lng: -97.7431,
    address: "2100 E Riverside Dr",
    city: "Austin",
    state: "TX",
    zip: "78741",
    serviceSlug: "hvac",
    planType: "premium" as const,
  },
  {
    name: "Lone Star Electric",
    slug: "lone-star-electric",
    description:
      "Lone Star Electric is a family-owned electrical contractor serving Austin and surrounding cities. Panel upgrades, EV charger installation, outdoor lighting, and complete rewires. Licensed master electrician on every job. Competitive pricing with no hidden fees.",
    phone: "5125550505",
    email: "hello@lonestarelectric.com",
    website: "https://lonestarelectric.com",
    yearsInBusiness: 20,
    insuranceVerified: false,
    verifiedStatus: "claimed" as const,
    listingSource: "self_registered" as const,
    rating: 4.5,
    reviewCount: 19,
    profileCompleteness: 72,
    hours: {
      mon: { open: "08:00", close: "17:00" },
      tue: { open: "08:00", close: "17:00" },
      wed: { open: "08:00", close: "17:00" },
      thu: { open: "08:00", close: "17:00" },
      fri: { open: "08:00", close: "17:00" },
      sat: null,
      sun: null,
    },
    lat: 30.4394,
    lng: -97.62,
    address: "456 Pfluger St",
    city: "Pflugerville",
    state: "TX",
    zip: "78660",
    serviceSlug: "electricians",
    planType: "basic" as const,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Upsert services
  console.log("  → Seeding 50 service categories...");
  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: {
        name: svc.name,
        slug: svc.slug,
        isPublic: svc.isPublic,
        isActive: true,
        sortOrder: svc.sortOrder,
        description: `Find trusted ${svc.name.toLowerCase()} in Austin, TX and surrounding cities.`,
      },
    });
  }

  // Upsert locations
  console.log("  → Seeding 13 Austin-metro locations...");
  for (const loc of locations) {
    await prisma.location.upsert({
      where: { slug: loc.slug },
      update: {},
      create: {
        name: loc.name,
        slug: loc.slug,
        type: "city",
        isActive: true,
        lat: loc.lat,
        lng: loc.lng,
      },
    });
  }

  // Seed sample contractors
  console.log("  → Seeding 5 sample contractors...");
  for (const contractor of sampleContractors) {
    const { serviceSlug, planType, ...contractorData } = contractor;

    const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
    const austinLocation = await prisma.location.findUnique({ where: { slug: "austin" } });
    const contractorCity = await prisma.location.findFirst({
      where: { name: contractor.city },
    });

    const existing = await prisma.contractor.findUnique({
      where: { slug: contractorData.slug },
    });

    if (!existing) {
      const created = await prisma.contractor.create({
        data: {
          ...contractorData,
          membership: {
            create: {
              planType,
              status: "active",
            },
          },
        },
      });

      if (service) {
        await prisma.contractorService.create({
          data: {
            contractorId: created.id,
            serviceId: service.id,
            isPrimary: true,
          },
        });
      }

      const locationsToAdd = [austinLocation, contractorCity].filter(
        (l, i, arr) => l && arr.findIndex((x) => x?.id === l.id) === i
      );

      for (const loc of locationsToAdd) {
        if (loc) {
          await prisma.contractorLocation.create({
            data: {
              contractorId: created.id,
              locationId: loc.id,
            },
          });
        }
      }

      // Add sample reviews for premium contractors
      if (planType === "premium") {
        await prisma.review.createMany({
          data: [
            {
              contractorId: created.id,
              reviewerName: "Sarah M.",
              reviewerEmail: "sarah.m@email.com",
              rating: 5,
              ratingService: 5,
              ratingResults: 5,
              ratingExpertise: 5,
              ratingCommunication: 5,
              ratingResponsiveness: 5,
              reviewText: "Absolutely fantastic work! Professional, clean, and on time. Would hire again in a heartbeat.",
              projectType: "Interior Painting",
              status: "approved",
            },
            {
              contractorId: created.id,
              reviewerName: "James T.",
              reviewerEmail: "james.t@email.com",
              rating: 5,
              ratingService: 4,
              ratingResults: 5,
              ratingExpertise: 5,
              ratingCommunication: 5,
              ratingResponsiveness: 4,
              reviewText: "Great quality and fair pricing. The team was respectful of our home and finished ahead of schedule.",
              projectType: "Exterior Painting",
              status: "approved",
            },
          ],
        });
      }
    }
  }

  // Seed SEO pages for all 260 service × location combinations
  console.log("  → Seeding 260 SEO pages for service × location matrix...");
  const publicServices = await prisma.service.findMany({ where: { isPublic: true } });
  const allLocations = await prisma.location.findMany({ where: { isActive: true } });

  for (const svc of publicServices) {
    for (const loc of allLocations) {
      const slug = `${loc.slug}-${svc.slug}`;
      await prisma.seoPage.upsert({
        where: { slug },
        update: {},
        create: {
          pageType: "service_location",
          serviceId: svc.id,
          locationId: loc.id,
          slug,
          title: `Best ${svc.name} in ${loc.name}, TX | ContractorsAustin.com`,
          metaDescription: `Find trusted ${svc.name.toLowerCase()} in ${loc.name}, TX. Browse local contractors, read verified reviews, and get free quotes. Serving ${loc.name} and surrounding areas.`,
          isPublished: true,
        },
      });
    }

    // Service-level SEO page
    await prisma.seoPage.upsert({
      where: { slug: svc.slug },
      update: {},
      create: {
        pageType: "service",
        serviceId: svc.id,
        slug: svc.slug,
        title: `Best ${svc.name} in Austin, TX | ContractorsAustin.com`,
        metaDescription: `Find top-rated ${svc.name.toLowerCase()} in Austin, TX. Compare local contractors, read verified reviews, and get free quotes. Serving all Austin neighborhoods.`,
        isPublished: true,
      },
    });
  }

  // Location-level SEO pages
  for (const loc of allLocations) {
    const slug = `${loc.slug}-contractors`;
    await prisma.seoPage.upsert({
      where: { slug },
      update: {},
      create: {
        pageType: "location",
        locationId: loc.id,
        slug,
        title: `Top Contractors in ${loc.name}, TX | ContractorsAustin.com`,
        metaDescription: `Find trusted home service contractors in ${loc.name}, TX. Browse verified professionals, read reviews, and get free quotes from local contractors serving ${loc.name}.`,
        isPublished: true,
      },
    });
  }

  // Seed sample guide posts
  console.log("  → Seeding sample guide posts...");
  const guides = [
    {
      slug: "how-to-hire-a-painter-in-austin",
      title: "How to Hire a Painter in Austin, TX: The Complete Guide",
      excerpt: "Everything you need to know before hiring a residential painter in Austin — from getting quotes to checking credentials.",
      content: `# How to Hire a Painter in Austin, TX\n\nHiring the right painter can make all the difference in your home improvement project. Whether you're refreshing interior walls or tackling a full exterior repaint, this guide covers everything Austin homeowners need to know.\n\n## 1. Define Your Project Scope\n\nBefore reaching out to painters, know what you need: interior vs. exterior, number of rooms, surface prep required, and your desired finish quality.\n\n## 2. Get Multiple Quotes\n\nAlways get at least 3 quotes. Use ContractorsAustin.com to find painters in your area, compare their ratings, and submit a single quote request to multiple pros at once.\n\n## 3. Check Credentials\n\nVerify that any painter you hire carries general liability insurance and workers' compensation coverage. Ask to see certificates before work begins.\n\n## 4. Review Their Portfolio\n\nAsk to see photos of recent projects similar to yours. Look for clean lines, consistent coverage, and attention to detail.\n\n## 5. Get Everything in Writing\n\nA proper contract should include: scope of work, materials to be used, timeline, payment schedule, and warranty terms.\n\n## Austin Painting Costs\n\nExpect to pay $2–$4 per square foot for interior painting and $1.50–$3.50 per square foot for exterior painting in the Austin area. Prep work, primer, and number of coats affect the final price.\n\n## Red Flags to Watch For\n\n- Extremely low bids (may indicate poor materials or cut corners)\n- Requesting full payment upfront\n- No written estimate or contract\n- No proof of insurance`,
      metaTitle: "How to Hire a Painter in Austin, TX: The Complete Guide | ContractorsAustin.com",
      metaDesc: "Learn how to find and hire the best residential painters in Austin, TX. Includes cost estimates, what to look for, and questions to ask.",
    },
    {
      slug: "how-to-hire-a-roofer-in-austin",
      title: "How to Hire a Roofer in Austin, TX: Everything You Need to Know",
      excerpt: "Austin's weather is tough on roofs. Learn how to find a qualified roofer, understand pricing, and avoid common contractor scams.",
      content: `# How to Hire a Roofer in Austin, TX\n\nAustin's extreme heat, hail storms, and occasional freezes put tremendous stress on residential roofs. When it's time for repairs or replacement, choosing the right roofer is critical.\n\n## Signs You Need Roof Work\n\n- Missing or curling shingles\n- Granules collecting in gutters\n- Daylight visible through roof boards\n- Water stains on interior ceilings\n- Roof age exceeding 20 years\n\n## Getting Roofing Quotes in Austin\n\nAlways get 3 written estimates. Most Austin roofers offer free inspections. Use ContractorsAustin.com to connect with verified roofers serving your area.\n\n## Texas Roofing License Requirements\n\nTexas does not require a statewide roofing license, but contractors should carry general liability insurance (minimum $300,000) and workers' compensation for their crew.\n\n## Average Roofing Costs in Austin\n\n- Roof repair: $400–$2,500\n- Partial replacement: $3,000–$8,000\n- Full replacement (1,800 sq ft): $8,000–$18,000\n\n## Insurance Claims\n\nIf your damage is storm-related, file with your homeowner's insurance first. A reputable roofer will work directly with your adjuster and provide a proper damage assessment.`,
      metaTitle: "How to Hire a Roofer in Austin, TX | ContractorsAustin.com",
      metaDesc: "Find the best roofing contractors in Austin. Learn what to look for, understand costs, and avoid roofing scams in the Austin, TX area.",
    },
    {
      slug: "ac-repair-vs-replacement-austin",
      title: "AC Repair vs. Replacement: What Austin Homeowners Need to Know",
      excerpt: "Is your Austin AC struggling? Learn when to repair and when to replace, plus average costs for the Austin, TX market.",
      content: `# AC Repair vs. Replacement in Austin, TX\n\nWith Austin summers regularly hitting 100°F+, a working AC isn't optional — it's a health issue. When your system breaks down, the big question is: repair or replace?\n\n## The 5,000 Rule\n\nMultiply the age of your AC by the repair cost. If the result exceeds $5,000, replacement is usually the smarter investment.\n\n## When to Repair\n\n- System is under 10 years old\n- Repair cost is under $1,500\n- System is properly sized for your home\n- Only one component needs replacing\n\n## When to Replace\n\n- System is over 15 years old\n- Repair cost exceeds 50% of replacement cost\n- System uses R-22 refrigerant (phased out)\n- Energy bills are consistently high\n- Multiple components failing\n\n## Austin AC Costs\n\n- AC tune-up: $75–$150\n- Common repairs: $150–$800\n- New central AC unit (2,000 sq ft home): $4,500–$8,500\n\n## Finding a Trusted HVAC Contractor\n\nLook for NATE-certified technicians. Always get a written quote before work begins. Use ContractorsAustin.com to find verified HVAC contractors in your area.`,
      metaTitle: "AC Repair vs. Replacement in Austin, TX | ContractorsAustin.com",
      metaDesc: "Austin homeowners: learn when to repair vs. replace your AC. Includes cost estimates and tips for finding a trusted HVAC contractor.",
    },
  ];

  for (const guide of guides) {
    await prisma.guidePost.upsert({
      where: { slug: guide.slug },
      update: {},
      create: guide,
    });
  }

  // Seed sample project posts
  console.log("  → Seeding sample project posts...");
  await prisma.projectPost.upsert({
    where: { slug: "westlake-kitchen-remodel" },
    update: {},
    create: {
      slug: "westlake-kitchen-remodel",
      title: "Complete Kitchen Remodel in Westlake Hills",
      excerpt: "A full kitchen transformation including custom cabinets, quartz countertops, and professional painting.",
      content: "This complete kitchen remodel in Westlake Hills included demolition of the existing kitchen, installation of custom shaker-style cabinets, quartz countertops, and a complete paint refresh. The project took 6 weeks and came in on budget.",
      city: "Austin",
      serviceSlug: "general-contractors",
      isPublished: true,
    },
  });

  console.log("✅ Database seeded successfully!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
