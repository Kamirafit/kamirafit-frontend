"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import SpotlightSearch from "./SpotlightSearch";

type SpotlightContextValue = {
  open: boolean;
  setOpen: (value: boolean) => void;
  toggle: () => void;
};

const SpotlightContext = createContext<SpotlightContextValue | null>(null);

export function useSpotlight(): SpotlightContextValue {
  const ctx = useContext(SpotlightContext);
  if (!ctx) {
    throw new Error("useSpotlight must be used within <SpotlightProvider>");
  }
  return ctx;
}

export default function SpotlightProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [open, setOpenState] = useState(false);

  const setOpen = useCallback((value: boolean) => setOpenState(value), []);
  const toggle = useCallback(() => setOpenState((v) => !v), []);

  // Global keyboard shortcut: ⌘K / Ctrl+K to toggle, Escape to close.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isK = e.key === "k" || e.key === "K";
      if (isK && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenState((v) => !v);
        return;
      }
      if (e.key === "Escape") {
        setOpenState(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const value = useMemo(
    () => ({ open, setOpen, toggle }),
    [open, setOpen, toggle],
  );

  return (
    <SpotlightContext.Provider value={value}>
      {children}
      <SpotlightSearch />
    </SpotlightContext.Provider>
  );
}
