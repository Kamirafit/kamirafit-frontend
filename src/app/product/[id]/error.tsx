"use client";

import RouteErrorState from "@/components/states/RouteErrorState";

export default function ProductError({ reset }: { reset: () => void }) {
  return <RouteErrorState reset={reset} message="We couldn’t load this product. Please try again." />;
}
