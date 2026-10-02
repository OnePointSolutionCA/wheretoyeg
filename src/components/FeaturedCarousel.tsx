import type { Business } from "@/lib/types";
import { BusinessCard } from "./BusinessCard";
import { Card3D } from "./Card3D";
import { Carousel } from "./Carousel";

export function FeaturedCarousel({ businesses, categoryNames }: { businesses: Business[]; categoryNames: Record<string, string> }) {
  return (
    <Carousel label="Featured businesses" itemClassName="w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]">
      {businesses.map((b) => (
        <Card3D key={b.slug}>
          <BusinessCard business={b} categoryName={categoryNames[b.category]} />
        </Card3D>
      ))}
    </Carousel>
  );
}
