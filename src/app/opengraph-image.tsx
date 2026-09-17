import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "KamiraFit — Luxury Clothing & Designer Apparel";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #111111 0%, #2A0810 50%, #111111 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          color: "#FAF7F2",
          fontFamily: "sans-serif",
          position: "relative",
          border: "8px solid #C4A47C",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 50,
            fontSize: 20,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#C4A47C",
            fontWeight: "bold",
          }}
        >
          KAMIRAFIT CREATION
        </div>
        <div
          style={{
            fontSize: 68,
            fontWeight: "bold",
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Elevate Your Everyday Style
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#C4A47C",
            textAlign: "center",
            maxWidth: 800,
            marginBottom: 35,
            fontWeight: 500,
          }}
        >
          Designer Kurtis • Co-ord Sets • Dresses • Luxury Streetwear
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            background: "rgba(196, 164, 124, 0.15)",
            border: "1px solid rgba(196, 164, 124, 0.4)",
            borderRadius: 50,
            padding: "12px 28px",
            fontSize: 18,
            fontWeight: "bold",
            color: "#FFFFFF",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Shop Online Across India &amp; Worldwide · kamirafit.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
