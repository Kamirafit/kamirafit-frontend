import { NextRequest, NextResponse } from "next/server";

export function middleware(_request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";

  let apiConnectHost = "";
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      apiConnectHost = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
    } catch {
      apiConnectHost = "";
    }
  }

  const connectSources = [
    "'self'",
    "http://localhost:10000",
    "https://kamirafit-backend.onrender.com",
    "https://www.google.com",
    "https://api.razorpay.com",
    "https://checkout.razorpay.com",
    "https://lumberjack.razorpay.com",
    "https://lumberjack-cx.razorpay.com",
    "https://*.razorpay.com",
    apiConnectHost,
  ]
    .filter(Boolean)
    .join(" ");

  const productImageHosts = (
    process.env.NEXT_PUBLIC_PRODUCT_IMAGE_HOSTS ?? "images.unsplash.com"
  )
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);

  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://checkout.razorpay.com https://*.razorpay.com ${
      isDev ? " 'unsafe-eval'" : ""
    }`,
    "style-src 'self' 'unsafe-inline' https://www.gstatic.com",
    `img-src 'self' data: blob: https: https://www.google.com https://www.gstatic.com https://cdn.razorpay.com https://*.razorpay.com ${productImageHosts
      .map((host) => `https://${host}`)
      .join(" ")}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src ${connectSources}`,
    "frame-src 'self' https://www.google.com https://api.razorpay.com https://checkout.razorpay.com https://*.razorpay.com",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");

  const response = NextResponse.next();
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    {
      source:
        "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|opengraph-image).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
