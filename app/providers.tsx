"use client";

import { useRef, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/features/product/store";
import SpotlightProvider from "@/components/search/SpotlightProvider";

export default function Providers({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = makeStore();
  }
  return (
    <Provider store={storeRef.current}>
      <SpotlightProvider>{children}</SpotlightProvider>
    </Provider>
  );
}
