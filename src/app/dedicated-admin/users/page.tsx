import { Suspense } from "react";
import UsersPage from "@/features/admin/pages/UsersPage";
import AdminTableSkeleton from "@/components/skeleton/AdminTableSkeleton";

export default function AdminUsersRoute() {
  return (
    <Suspense fallback={<AdminTableSkeleton />}>
      <UsersPage />
    </Suspense>
  );
}
