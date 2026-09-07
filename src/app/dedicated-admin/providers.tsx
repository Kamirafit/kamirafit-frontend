"use client";

import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeAdminStore, type AdminStore } from "@/features/admin/store";
import AuthHydrator from "@/features/auth/components/AuthHydrator";
import QueryProvider from "@/providers/QueryProvider";
import OfflineBanner from "@/components/states/OfflineBanner";

export default function AdminProviders({ children }: { children: ReactNode }) {
  const storeRef = useRef<AdminStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = makeAdminStore();
  }

  return (
    <Provider store={storeRef.current}>
      <QueryProvider>
        <AuthHydrator storageKey="kamira_auth_admin">
          <OfflineBanner />
          {children}
        </AuthHydrator>
      </QueryProvider>
    </Provider>
  );
}
