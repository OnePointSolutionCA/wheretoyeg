import { SITE } from "./site";
import type { Business, Hours } from "./types";
import { parseAddress } from "./place";
import { parseDayHours } from "./openNow";

const CATEGORY_TYPE: Record<string, string> = {
  restaurants: "Restaurant",
  "cafes-coffee-shops": "CafeOrCoffeeShop",
  bakeries: "Bakery",
  catering: "FoodEstablishment",
  "grocery-markets": "GroceryStore",
  barbers: "BarberShop",
  "hair-salons": "HairSalon",
  "nail-salons": "NailSalon",
  "lash-techs": "BeautySalon",
  "spas-esthetics": "DaySpa",
  "gyms-fitness": "ExerciseGym",
  "auto-repair": "AutoRepair",
  electricians: "Electrician",
  plumbers: "HomeAndConstructionBusiness",
  "cleaning-services": "HomeAndConstructionBusiness",
  medical: "MedicalBusiness",
  "professional-services": "ProfessionalService",
  "activities-fun": "EntertainmentBusiness",
};

const DAY_MAP: Record<keyof Hours, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function hhmm(mins: number): string {
  const t = mins % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

function parseHoursSpec(hours: Hours | undefined) {
  if (!hours) return [];
  const specs: object[] = [];
  for (const [key, value] of Object.entries(hours)) {
    const day = DAY_MAP[key as keyof Hours];
    if (!day) continue;
    for (const [open, close] of parseDayHours(value) ?? []) {
      specs.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day,
        opens: hhmm(open),
        // A close earlier than the open means the next morning; a midnight close reads as the end of the day.
        closes: close === 1440 ? "23:59" : hhmm(close),
      });
    }
  }
  return specs;
}

export function businessSchema(b: Business) {
  const schemaType = CATEGORY_TYPE[b.category] || "LocalBusiness";
  const sameAs: string[] = [];
  if (b.website) sameAs.push(b.website);
  if (b.instagram) sameAs.push(b.instagram);
  if (b.facebook) sameAs.push(b.facebook);
  if (b.tiktok) sameAs.push(b.tiktok);
  if (b.google_maps_url) sameAs.push(b.google_maps_url);

  const hoursSpec = parseHoursSpec(b.hours);
  const { locality, postalCode } = parseAddress(b.address);

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    name: b.name,
    description: b.description,
    url: `${SITE.url}/${b.category}/${b.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: locality,
      addressRegion: "AB",
      ...(postalCode ? { postalCode } : {}),
      addressCountry: "CA",
    },
    ...(b.latitude && b.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: b.latitude, longitude: b.longitude } }
      : {}),
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.logo ? { logo: `${SITE.url}${b.logo}` } : {}),
    ...(b.photos?.length ? { image: `${SITE.url}${b.photos[0]}` } : {}),
    priceRange: b.price_range,
    areaServed: { "@type": "City", name: "Edmonton" },
    ...(sameAs.length ? { sameAs } : {}),
    ...(hoursSpec.length ? { openingHoursSpecification: hoursSpec } : {}),
    ...(b.rating && b.review_count
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: b.rating,
            reviewCount: b.review_count,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
    ...(b.reviews?.length
      ? {
          review: b.reviews.map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.name },
            datePublished: r.date,
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            reviewBody: r.comment,
          })),
        }
      : {}),
  };
}
