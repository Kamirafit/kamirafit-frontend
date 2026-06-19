import type { ReactNode } from "react";
import StateShell from "./StateShell";

type Props = { title: string; description: string; action?: ReactNode; className?: string };

export default function EmptyState(props: Props) {
  return <StateShell icon="○" {...props} />;
}
