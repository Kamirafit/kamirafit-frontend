import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/shop",
          "/product/",
          "/privacy",
          "/terms",
          "/cookies",
          "/shipping",
          "/returns",
          "/size-guide",
          "/contact",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/dedicated-admin",
          "/dedicated-admin/",
          "/account",
          "/account/",
          "/cart",
          "/cart/",
          "/checkout",
          "/checkout/",
          "/login",
        ],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
