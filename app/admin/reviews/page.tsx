import ReviewsClient from "@/components/admin/reviews/ReviewsClient";
import { fetchReviews } from "@/lib/actions/review-actions";

export const dynamic = 'force-dynamic';

export default async function ReviewsPage() {
  const reviews = await fetchReviews(1, 20);
  return <ReviewsClient initialData={reviews.data} hasMore={reviews.hasMore} limit={20} />;
}
