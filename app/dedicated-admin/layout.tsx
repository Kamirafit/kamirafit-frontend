import type { Metadata } from "next";
import AdminSidebar from "@/features/admin/components/AdminSidebar";

export const metadata: Metadata = {
  title: "Admin — KamiraFit",
  description: "KamiraFit dedicated admin panel.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="flex min-h-screen">
        <AdminSidebar />
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12 lg:px-10 lg:py-14">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
