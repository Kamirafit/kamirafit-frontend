import QueriesPage from "@/features/admin/pages/QueriesPage";

export const metadata = {
  title: "Customer Queries | KamiraFit Admin",
  description: "View and manage incoming customer inquiries and contact requests.",
};

export default function AdminQueriesRoute() {
  return <QueriesPage />;
}
