"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div role="status" aria-live="polite" className="sticky top-0 z-[200] border-b border-amber-400/30 bg-amber-950 px-4 py-2 text-center text-xs font-medium text-amber-100">
      You’re offline. Saved content remains available; new requests will resume when your connection returns.
    </div>
  );
}
