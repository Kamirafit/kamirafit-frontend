import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const productImageHosts = (
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS ?? "images.unsplash.com"
)
  .split(",")
  .map((host) => host.trim().toLowerCase())
  .filter(Boolean);

let apiConnectHost = "";
if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    apiConnectHost = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
  } catch {
    apiConnectHost = "";
  }
}

const connectSources = ["'self'", "http://localhost:10000", "https://kamirafit-backend.onrender.com", apiConnectHost].filter(Boolean).join(" ");

const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${productImageHosts
    .map((host) => `https://${host}`)
    .join(" ")}`,
  "font-src 'self' data:",
  `connect-src ${connectSources}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: contentSecurityPolicy,
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    contentDispositionType: "attachment",
    dangerouslyAllowSVG: false,
    remotePatterns: [
      ...productImageHosts.map((hostname) => ({
        protocol: "https" as const,
        hostname,
      })),
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/dedicated-admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
          ...securityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
