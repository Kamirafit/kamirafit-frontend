import Container from "@/components/ui/Container";
import LoadingState from "@/components/states/LoadingState";

export default function Loading() {
  return <Container className="py-16 sm:py-24"><LoadingState label="Loading KamiraFit…" /></Container>;
}
