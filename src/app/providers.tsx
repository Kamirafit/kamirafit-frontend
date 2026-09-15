"use client";

import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/features/product/store";
import SpotlightProvider from "@/components/search/SpotlightProvider";
import ContactModalProvider from "@/components/contact/ContactModalProvider";
import AuthHydrator from "@/features/auth/components/AuthHydrator";
import QueryProvider from "@/providers/QueryProvider";
import CommerceStateSync from "@/features/product/components/CommerceStateSync";
import OfflineBanner from "@/components/states/OfflineBanner";
import FreeShippingProgressBar from "@/components/cart/FreeShippingProgressBar";

export default function Providers({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }
  return (
    <Provider store={storeRef.current}>
      <QueryProvider>
        <AuthHydrator storageKey="kamira_auth_customer">
          <OfflineBanner />
          <CommerceStateSync />
          <SpotlightProvider>
            <ContactModalProvider>
              {children}
              <FreeShippingProgressBar />
            </ContactModalProvider>
          </SpotlightProvider>
        </AuthHydrator>
      </QueryProvider>
    </Provider>
  );
}
