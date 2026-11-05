import { SITE } from "./site";
import type { Business, Hours } from "./types";
import { parseAddress } from "./place";
import { parseDayHours } from "./openNow";

/** Shops filed under a service category that have a more exact schema.org type. */
const SUBCATEGORY_TYPE: Record<string, string> = { florists: "Florist", "clothing-gifts": "ClothingStore" };

const CATEGORY_TYPE: Record<string, string> = {
  restaurants: "Restaurant",
  "cafes-coffee-shops": "CafeOrCoffeeShop",
  bakeries: "Bakery",
  catering: "FoodEstablishment",
  "grocery-markets": "GroceryStore",
  // schema.org has no BarberShop type (validators flag it); HairSalon is the closest real one.
  barbers: "HairSalon",
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

/**
 * A seasonal place's weekly hours only hold between its confirmed dates, with its special days on top
 * (a closed day reads 00:00 to 00:00). Until the dates are confirmed no hours are given, so search
 * engines never read them as all year.
 */
function seasonHoursSpec(b: Business) {
  const s = b.season;
  if (!s) return parseHoursSpec(b.hours);
  if (!s.from || !s.to) return [];
  const special = Object.entries(s.dates ?? {}).flatMap(([date, value]) => {
    const intervals = parseDayHours(value);
    if (intervals == null) return [];
    return (intervals.length ? intervals : [[0, 0]]).map(([open, close]) => ({
      "@type": "OpeningHoursSpecification",
      opens: hhmm(open),
      closes: close === 1440 ? "23:59" : hhmm(close),
      validFrom: date,
      validThrough: date,
    }));
  });
  return [...parseHoursSpec(b.hours).map((spec) => ({ ...spec, validFrom: s.from, validThrough: s.to })), ...special];
}

/**
 * LocalBusiness markup for a listing page.
 * Ratings and reviews come from Google Maps, so they are shown on the page but left out of the markup:
 * Google's review snippet rules don't allow marking up ratings collected on another site.
 */
export function businessSchema(b: Business) {
  const schemaType = (b.subcategory && SUBCATEGORY_TYPE[b.subcategory]) || CATEGORY_TYPE[b.category] || "LocalBusiness";
  const sameAs: string[] = [];
  if (b.website) sameAs.push(b.website);
  if (b.instagram) sameAs.push(b.instagram);
  if (b.facebook) sameAs.push(b.facebook);
  if (b.tiktok) sameAs.push(b.tiktok);
  if (b.google_maps_url) sameAs.push(b.google_maps_url);

  const hoursSpec = seasonHoursSpec(b);
  const { locality, postalCode } = parseAddress(b.address);

  const pageUrl = `${SITE.url}/${b.category}/${b.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": `${pageUrl}#business`,
    name: b.name,
    description: b.description,
    url: pageUrl,
    address: {
      "@type": "PostalAddress",
      // Online shops and service area businesses list a city or area, not a street.
      ...(/\d/.test(b.address) ? { streetAddress: b.address } : {}),
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
    areaServed: { "@type": "City", name: locality },
    ...(sameAs.length ? { sameAs } : {}),
    ...(hoursSpec.length ? { openingHoursSpecification: hoursSpec } : {}),
  };
}
