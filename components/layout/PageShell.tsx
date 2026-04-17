import type { ReactNode } from "react";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";

type Props = {
  children: ReactNode;
  /** Optional className appended to the <main> element. */
  mainClassName?: string;
};

/**
 * Standard page chrome: Navbar + main + Footer. Every app route renders
 * inside a <PageShell> so the global layout stays consistent and drift-free.
 */
export default function PageShell({ children, mainClassName = "" }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      <Navbar />
      <main className={`flex-1 ${mainClassName}`.trim()}>{children}</main>
      <Footer />
    </div>
  );
}
