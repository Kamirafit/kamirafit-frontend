import type { ReactNode } from "react";
import Footer from "@/components/home/Footer";
import Navbar from "@/components/home/Navbar";

type Props = { children: ReactNode; mainClassName?: string };

export default function PageShell({ children, mainClassName = "" }: Props) {
  return <div className="relative flex min-h-screen flex-col bg-ink text-paper"><Navbar /><main className={`flex-1 ${mainClassName}`.trim()}>{children}</main><Footer /></div>;
}
