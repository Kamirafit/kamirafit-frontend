"use client";

import Link from "next/link";
import { ArrowRightIcon } from "./icons";

export default function Hero() {
  const handleExploreCategories = () => {
    const el = document.getElementById("categories") || document.getElementById("portals");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      className="relative w-full overflow-hidden border-b border-outline-variant/30"
      style={{
        background:
          "linear-gradient(to left, rgba(253, 207, 211, 0.45), rgba(245, 237, 230, 0.25) 40%, rgba(251, 249, 245, 0) 75%)",
      }}
    >
      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-10">
        {/* Asymmetric Magazine Master Layout */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 items-end">
          {/* Typographic Dominance & Editorial Composition */}
          <div className="flex flex-col justify-between z-10 max-w-3xl">
            {/* Editorial Header Badge & Origin */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 sm:w-10 bg-outline-variant" />
              <span className="text-xs uppercase font-serif italic text-surface-tint tracking-wider">
                Curated in KOLKATA
              </span>
            </div>

            {/* Dramatic Headline Composition */}
            <div className="relative">
              <h1 className="font-serif text-3xl sm:text-5xl xl:text-6xl font-normal text-primary tracking-[-0.03em] leading-[1.08]">
                Elevate Your <br />
                <span className="italic text-primary">Everyday Style</span>
              </h1>
              <p className="mt-3 sm:mt-4 text-on-surface-variant font-sans text-sm sm:text-base max-w-xl font-light leading-relaxed">
                Premium comfort. Effortless fashion. Thoughtfully crafted essentials
                designed to move with you. Day after day.
              </p>
            </div>

            {/* High-End Interaction CTA Buttons */}
            <div className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-outline-variant/40 flex flex-wrap items-center gap-3">
              <Link
                href="/shop"
                scroll={true}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-primary-container text-white font-sans text-xs uppercase font-bold tracking-[0.16em] hover:bg-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all group"
              >
                <span>SHOP NOW</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                type="button"
                onClick={handleExploreCategories}
                className="inline-flex items-center gap-2 px-6 py-4 rounded-full bg-surface-container text-primary font-sans text-xs uppercase font-bold tracking-[0.14em] hover:bg-surface-container-high transition-all cursor-pointer"
              >
                <span>EXPLORE CATEGORIES</span>
              </button>
            </div>

            {/* Client Micro Standards Strip */}
            <dl className="mt-10 grid grid-cols-3 gap-4 sm:gap-6 border-t border-outline-variant/30 pt-6 max-w-xl">
              <div>
                <dt className="text-[10px] uppercase font-mono tracking-widest text-outline">
                  ORIGIN
                </dt>
                <dd className="mt-1 font-serif text-base sm:text-lg font-medium text-primary">
                  Kolkata, IN
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase font-mono tracking-widest text-outline">
                  TAILORING
                </dt>
                <dd className="mt-1 font-serif text-base sm:text-lg font-medium text-primary">
                  Artisanal Fit
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase font-mono tracking-widest text-outline">
                  COURIER
                </dt>
                <dd className="mt-1 font-serif text-base sm:text-lg font-medium text-primary">
                  Pan-India Express
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Background Textile Vector Drape Artwork from Stitch */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full lg:w-1/2 pointer-events-none overflow-hidden select-none -z-0 flex items-center justify-center opacity-70 lg:opacity-95"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full max-w-[700px] max-h-[640px]"
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ambient Soft Radial Aura */}
          <circle cx="360" cy="280" r="220" fill="#ffdcf0" fillOpacity="0.35" filter="blur(40px)" />
          <ellipse cx="240" cy="380" rx="160" ry="120" fill="#fce5df" fillOpacity="0.4" filter="blur(32px)" />

          {/* 1. Large Fluid Textile Drape Contour */}
          <path
            d="M180,60 C260,110 390,70 470,160 C530,230 510,380 430,460 C360,530 260,550 190,490 C120,430 110,320 160,230 C200,160 210,120 180,60 Z"
            fill="#4a151e"
            fillOpacity="0.035"
            stroke="#4a151e"
            strokeWidth="1.2"
            strokeOpacity="0.15"
          />
          <path
            d="M220,110 C300,170 410,140 450,250 C480,330 430,440 370,490 C320,530 240,510 190,430 C150,370 170,270 210,210 C240,160 230,130 220,110 Z"
            fill="#c87a74"
            fillOpacity="0.05"
            stroke="#c87a74"
            strokeWidth="1.2"
            strokeOpacity="0.22"
            strokeDasharray="6 4"
          />

          {/* 2. Elegant Tailor's Mannequin */}
          <g transform="translate(280, 80)" stroke="#4a151e" strokeOpacity="0.25">
            <path d="M70,30 L70,55" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="70" cy="28" rx="14" ry="6" fill="none" strokeWidth="1.5" />
            <path
              d="M38,70 C48,60 58,56 70,56 C82,56 92,60 102,70 C116,84 126,108 126,140 C126,170 112,192 100,210 C88,228 84,242 86,280 L54,280 C56,242 52,228 40,210 C28,192 14,170 14,140 C14,108 24,84 38,70 Z"
              fill="#4a151e"
              fillOpacity="0.04"
              strokeWidth="1.5"
            />
            <path d="M70,56 L70,280" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 3" />
            <path d="M48,82 C56,120 56,190 48,240" strokeWidth="1" strokeOpacity="0.18" />
            <path d="M92,82 C84,120 84,190 92,240" strokeWidth="1" strokeOpacity="0.18" />
            <path d="M44,196 C56,200 84,200 96,196" strokeWidth="1.2" strokeOpacity="0.3" />
            <path d="M70,280 L70,390" strokeWidth="2" strokeLinecap="round" />
            <path d="M45,390 L95,390" strokeWidth="2" strokeLinecap="round" />
            <path d="M48,390 L38,415 M92,390 L102,415" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* 3. Sculptural Coat Hanger Contour */}
          <g transform="translate(130, 90)" stroke="#785559" strokeOpacity="0.3">
            <path
              d="M110,65 C110,48 124,35 138,45 C150,53 144,68 132,74 L132,84"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M50,118 C85,102 120,86 132,84 C144,86 179,102 214,118 C204,124 195,126 132,106 C69,126 60,124 50,118 Z"
              fill="#785559"
              fillOpacity="0.04"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <circle cx="132" cy="95" r="2" fill="#785559" fillOpacity="0.4" />
          </g>

          {/* 4. Pattern-Cutting Notch Marks & Guide */}
          <g transform="translate(380, 220)" stroke="#4a151e" strokeOpacity="0.2">
            <path d="M10,20 L30,20 M15,14 L15,26 M25,16 L25,24" strokeWidth="1.2" />
            <path d="M45,10 C70,35 110,45 150,30" strokeWidth="1.2" strokeDasharray="4 3" fill="none" />
            <polygon points="85,24 90,16 95,24" fill="#4a151e" fillOpacity="0.2" />
            <text x="100" y="20" fontFamily="monospace" fontSize="9" fill="#4a151e" fillOpacity="0.35" letterSpacing="1.5">
              CUT 2x GRAIN
            </text>
          </g>

          {/* 5. Needle & Thread */}
          <g transform="translate(190, 180)">
            <path
              d="M0,90 C40,40 90,60 70,120 C50,180 140,190 180,140 C210,100 250,110 270,150"
              stroke="#785559"
              strokeWidth="1.2"
              strokeOpacity="0.25"
              fill="none"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <path d="M68,122 L62,136" stroke="#4a151e" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.45" />
            <circle cx="67" cy="124" r="0.8" fill="#fbf9f5" />
          </g>
        </svg>
      </div>
    </section>
  );
}
