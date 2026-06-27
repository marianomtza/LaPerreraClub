import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSeoSettings } from "@/lib/data";
import { getSiteUrl } from "@/lib/env";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { PerreraDock } from "@/components/site/perrera-dock";
import { CartProvider } from "@/components/store/cart-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSeoSettings();
  const title = seo.title || "La Perrera Club";
  const description = seo.description || "Música, comunidad, productos y booking desde La Perrera Club.";

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: title,
      template: `%s | ${title}`
    },
    description,
    openGraph: {
      title,
      description,
      siteName: "La Perrera Club",
      locale: "es_MX",
      type: "website",
      images: seo.imageUrl ? [{ url: seo.imageUrl }] : []
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: seo.imageUrl ? [seo.imageUrl] : []
    },
    alternates: {
      canonical: "/"
    }
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <PerreraDock />
        </CartProvider>
      </body>
    </html>
  );
}
