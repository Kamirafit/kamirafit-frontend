import type { Metadata } from "next";
import AdminProviders from "./providers";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin — KamiraFit",
  description: "KamiraFit dedicated admin panel.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProviders>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </AdminProviders>
  );
}
