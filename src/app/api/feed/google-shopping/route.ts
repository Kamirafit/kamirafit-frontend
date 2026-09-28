import { NextResponse } from "next/server";
import { productService } from "@/services/product";

export const dynamic = "force-dynamic";
export const revalidate = 300; // Cache feed for 5 minutes

function escapeXml(unsafe: string | null | undefined): string {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function resolveGoogleCategory(categoryName: string = ""): string {
  const cat = categoryName.toLowerCase();
  if (cat.includes("dress")) return "Apparel &amp; Accessories &gt; Clothing &gt; Dresses";
  if (cat.includes("kurti") || cat.includes("ethnic") || cat.includes("traditional"))
    return "Apparel &amp; Accessories &gt; Clothing &gt; Traditional &amp; Cultural Clothing";
  if (cat.includes("tee") || cat.includes("shirt") || cat.includes("top"))
    return "Apparel &amp; Accessories &gt; Clothing &gt; Shirts &amp; Tops";
  if (cat.includes("hoodie") || cat.includes("sweatshirt"))
    return "Apparel &amp; Accessories &gt; Clothing &gt; Outerwear &gt; Coats &amp; Jackets";
  if (cat.includes("co-ord") || cat.includes("coord") || cat.includes("set"))
    return "Apparel &amp; Accessories &gt; Clothing &gt; Outfit Sets";
  if (cat.includes("pant") || cat.includes("trouser") || cat.includes("bottom"))
    return "Apparel &amp; Accessories &gt; Clothing &gt; Pants";
  return "Apparel &amp; Accessories &gt; Clothing";
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://kamirafit.com";

  try {
    const products = await productService.getProducts();
    const activeProducts = (products || []).filter(
      (p) => p && p.isActive !== false && (!p.id.startsWith("p-0") || process.env.NODE_ENV !== "production")
    );

    let itemsXml = "";

    for (const product of activeProducts) {
      const canonicalId = product.slug || product.id;
      const productUrl = `${baseUrl}/product/${canonicalId}`;
      const title = escapeXml(product.name);
      const description = escapeXml(
        (product.description || product.name || "Premium luxury apparel from KamiraFit").replace(/\s+/g, " ").trim()
      );
      const images = (product.images && product.images.length > 0 ? product.images : [product.image]).filter(Boolean);
      const mainImage = images[0] ? escapeXml(images[0]) : `${baseUrl}/images/og-default.jpg`;
      const additionalImages = images
        .slice(1, 10)
        .map((img) => `<g:additional_image_link>${escapeXml(img)}</g:additional_image_link>`)
        .join("");

      const variants = Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [];
      const googleCategory = resolveGoogleCategory(product.category);

      if (variants.length > 0) {
        // Emit variant-level entries for accurate Google Shopping item targeting
        for (const variant of variants) {
          const variantSku = escapeXml(variant.sku || `KF-${product.id}-${variant.color}-${variant.size}`);
          const variantPrice = Number(variant.offerPrice ?? variant.price ?? product.price ?? 0).toFixed(2);
          const hasStock = (variant.stock ?? 0) > 0 || (variant.inventory?.available ?? 0) > 0;
          const availability = hasStock ? "in_stock" : "out_of_stock";
          const color = escapeXml(variant.color || "Standard");
          const size = escapeXml(variant.size || "Free Size");
          const shippingCost = Number(variantPrice) >= 999 ? "0.00 INR" : "99.00 INR";

          itemsXml += `
    <item>
      <g:id>${variantSku}</g:id>
      <g:item_group_id>${escapeXml(product.id)}</g:item_group_id>
      <g:title>${title} - ${color} (${size})</g:title>
      <g:description>${description}</g:description>
      <g:link>${productUrl}?color=${encodeURIComponent(variant.color || "")}&amp;size=${encodeURIComponent(variant.size || "")}</g:link>
      <g:image_link>${mainImage}</g:image_link>
      ${additionalImages}
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${variantPrice} INR</g:price>
      <g:brand>KamiraFit</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${escapeXml(product.category || "Apparel")}</g:product_type>
      <g:color>${color}</g:color>
      <g:size>${size}</g:size>
      <g:gender>female</g:gender>
      <g:age_group>adult</g:age_group>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Express</g:service>
        <g:price>${shippingCost}</g:price>
      </g:shipping>
    </item>`;
        }
      } else {
        // Single base product item
        const price = Number(product.price || 0).toFixed(2);
        const hasStock = product.isAvailable !== false;
        const availability = hasStock ? "in_stock" : "out_of_stock";
        const shippingCost = Number(price) >= 999 ? "0.00 INR" : "99.00 INR";

        itemsXml += `
    <item>
      <g:id>${escapeXml(product.id)}</g:id>
      <g:title>${title}</g:title>
      <g:description>${description}</g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${mainImage}</g:image_link>
      ${additionalImages}
      <g:condition>new</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price} INR</g:price>
      <g:brand>KamiraFit</g:brand>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${escapeXml(product.category || "Apparel")}</g:product_type>
      <g:gender>female</g:gender>
      <g:age_group>adult</g:age_group>
      <g:shipping>
        <g:country>IN</g:country>
        <g:service>Standard Express</g:service>
        <g:price>${shippingCost}</g:price>
      </g:shipping>
    </item>`;
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>KamiraFit Google Merchant Product Feed</title>
    <link>${baseUrl}</link>
    <description>Automated product catalog feed for Google Shopping and Free Product Listings</description>
    ${itemsXml}
  </channel>
</rss>`;

    return new NextResponse(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Failed to generate Google Shopping feed:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title></channel></rss>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
