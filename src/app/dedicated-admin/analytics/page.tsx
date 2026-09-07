import type { Metadata } from "next";
import AnalyticsPage from "@/features/admin/pages/AnalyticsPage";

export const metadata: Metadata = {
  title: "Analytics — KamiraFit Admin",
  description: "Executive business analytics, inventory velocity, and dead stock diagnostics.",
};

export default function AdminAnalyticsRoute() {
  return <AnalyticsPage />;
}
