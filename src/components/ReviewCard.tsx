import type { Review } from "@/lib/types";
import { StarRating } from "./StarRating";

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-teal">{review.name}</span>
        <span className="text-xs text-teal-300">{review.date}</span>
      </div>
      <div className="mt-1">
        <StarRating value={review.rating} compact size={13} />
      </div>
      <p className="mt-2 text-sm text-teal-500">{review.comment}</p>
    </div>
  );
}
