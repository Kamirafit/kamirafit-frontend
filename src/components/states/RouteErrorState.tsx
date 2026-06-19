"use client";

import PageShell from "@/components/layout/PageShell";
import Container from "@/components/ui/Container";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import ErrorState from "./ErrorState";
import OfflineState from "./OfflineState";

type Props = { reset: () => void; message?: string };

export default function RouteErrorState({ reset, message }: Props) {
  const isOnline = useOnlineStatus();
  return (
    <PageShell>
      <Container width="narrow" className="py-16 sm:py-24">
        {isOnline ? <ErrorState message={message} onRetry={reset} /> : <OfflineState onRetry={reset} />}
      </Container>
    </PageShell>
  );
}
