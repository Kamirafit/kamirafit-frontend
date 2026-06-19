"use client";

import RouteErrorState from "@/components/states/RouteErrorState";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return <RouteErrorState reset={reset} message="We couldn’t load this page. Your account and cart are safe." />;
}
