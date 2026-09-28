"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures that when returning to the home page (via back button, logo, or navigation),
 * the viewport always begins at the top (0, 0) instead of auto-scrolling down
 * to the categories section.
 */
export default function ScrollToTopOnHome() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/") {
      // 1. Remove legacy or lingering #categories hash from the URL without triggering navigation
      if (window.location.hash) {
        window.history.replaceState(null, "", "/");
      }

      // 2. Prevent the browser from automatically restoring the previous scroll position
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      // 3. Immediately reset scroll position to top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });

      const handlePopState = () => {
        if (window.location.pathname === "/") {
          if (window.location.hash) {
            window.history.replaceState(null, "", "/");
          }
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      };

      // Ensure consecutive frames stay at top if browser executes delayed scroll restoration
      const rAF = requestAnimationFrame(() => {
        if (window.location.pathname === "/") {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      });

      const timer = setTimeout(() => {
        if (window.location.pathname === "/" && window.scrollY > 0 && !window.location.hash) {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        }
      }, 60);

      window.addEventListener("popstate", handlePopState);
      return () => {
        cancelAnimationFrame(rAF);
        clearTimeout(timer);
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [pathname]);

  return null;
}
