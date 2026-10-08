import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// ---------------------------------------------------------------------------
// Fonts
// ---------------------------------------------------------------------------

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

// ---------------------------------------------------------------------------
// Site Metadata
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "UrbanNest — Discover Your Style, Closer.",
    template: "%s | UrbanNest",
  },
  description:
    "UrbanNest is a multi-vendor fashion marketplace connecting you with local and online fashion stores. Discover trending styles, check local availability, and shop with confidence.",
  keywords: [
    "fashion marketplace",
    "online shopping",
    "local fashion stores",
    "clothing",
    "apparel",
    "multi-vendor",
    "UrbanNest",
  ],
  authors: [{ name: "UrbanNest" }],
  creator: "UrbanNest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "UrbanNest",
    title: "UrbanNest — Discover Your Style, Closer.",
    description:
      "Multi-vendor fashion marketplace. Shop from local stores and online sellers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "UrbanNest — Discover Your Style, Closer.",
    description: "Multi-vendor fashion marketplace.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
  width: "device-width",
  initialScale: 1,
};

// ---------------------------------------------------------------------------
// Root Layout
// ---------------------------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-white font-sans text-ink-950 antialiased">
        {children}
      </body>
    </html>
  );
}
