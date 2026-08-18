import { ReactNode } from "react";
import AccountSidebar from "@/features/account/components/AccountSidebar";
import AccountMobileNav from "@/features/account/components/AccountMobileNav";
import PageShell from "@/components/layout/PageShell";
import CustomerProtectedRoute from "@/features/auth/components/CustomerProtectedRoute";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell mainClassName="bg-ink-2">
      <CustomerProtectedRoute>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
          {/* Mobile Navigation Cards */}
          <div className="block md:hidden">
            <AccountMobileNav />
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] lg:gap-12">
            {/* Desktop Sidebar */}
            <div className="hidden md:block">
              <AccountSidebar />
            </div>
            
            {/* Main Content */}
            <div className="min-w-0">
              {children}
            </div>
          </div>
        </div>
      </CustomerProtectedRoute>
    </PageShell>
  );
}
