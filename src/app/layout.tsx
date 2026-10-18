import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans_Arabic } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-sans",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tansiq · تنسيق — Style first, then shop",
  description:
    "Premium casual fashion marketplace for Saudi Arabia: style first, then shop with confidence in color, fabric, and fit.",
  icons: {
    icon: [{ url: "/brand/tansiq-mark.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/tansiq-mark.jpg" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${plexArabic.variable} ${display.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
