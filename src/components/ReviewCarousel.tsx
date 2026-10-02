import Link from "next/link";
import { ReviewCard } from "./ReviewCard";
import { Carousel } from "./Carousel";
import type { Review } from "@/lib/types";

type ReviewWithBusiness = Review & {
  business: { name: string; slug: string; category: string };
};

export function ReviewCarousel({ reviews, tone = "light" }: { reviews: ReviewWithBusiness[]; tone?: "light" | "dark" }) {
  return (
    <Carousel label="Recent Google reviews" tone={tone} itemClassName="w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]">
      {reviews.map((r, i) => (
        <div key={i} className="flex h-full flex-col">
          <div className="flex-1">
            <ReviewCard review={r} />
          </div>
          <Link
            href={`/${r.business.category}/${r.business.slug}`}
            className={"mt-3 block text-xs font-semibold hover:underline " + (tone === "dark" ? "text-coral-300" : "text-coral")}
          >
            About {r.business.name} →
          </Link>
        </div>
      ))}
    </Carousel>
  );
}
