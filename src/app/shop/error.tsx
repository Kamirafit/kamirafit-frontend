"use client";

import RouteErrorState from "@/components/states/RouteErrorState";

export default function ShopError({ reset }: { reset: () => void }) {
  return <RouteErrorState reset={reset} message="We couldn’t load the shop right now." />;
}
