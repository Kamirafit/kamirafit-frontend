import { Suspense } from "react";
import ReviewsPage from "@/features/admin/pages/ReviewsPage";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";

export const metadata = {
  title: "Customer Reviews & Verification | KamiraFit Admin",
  description: "Review moderation queue — verify customer reviews and photos before publishing to the storefront.",
};

export default function AdminReviewsRoute() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <ReviewsPage />
    </Suspense>
  );
}
