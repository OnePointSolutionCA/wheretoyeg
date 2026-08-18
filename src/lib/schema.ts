import { SITE } from "./site";
import type { Business } from "./types";

export function businessSchema(b: Business) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: b.name,
    description: b.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.address,
      addressLocality: "Edmonton",
      addressRegion: "AB",
      addressCountry: "CA",
    },
    ...(b.latitude && b.longitude
      ? { geo: { "@type": "GeoCoordinates", latitude: b.latitude, longitude: b.longitude } }
      : {}),
    ...(b.phone ? { telephone: b.phone } : {}),
    ...(b.website ? { url: b.website } : {}),
    ...(b.photos?.length ? { image: `${SITE.url}${b.photos[0]}` } : {}),
    priceRange: b.price_range,
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
