import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { getUI } from "@/content/ui";
import { hasLocale, htmlLang, locales } from "@/lib/i18n";
import "../globals.css";

const inter = Inter({ subsets: ["latin", "latin-ext", "cyrillic"], variable: "--font-inter", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = { themeColor: "#1d1a26" };

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { meta } = getUI(lang);
  return {
    metadataBase: new URL("https://crm.caravanhouse.uz"),
    title: meta.title,
    description: meta.description,
    alternates: { canonical: `/${lang}`, languages: { ru: "/ru", uz: "/uz" } },
    openGraph: { title: meta.title, description: meta.description, url: `/${lang}`, type: "website" },
    robots: { index: false, follow: true },
  };
}

export default async function Layout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={htmlLang[lang]} className={`${inter.variable} antialiased`}>
      <body className="min-h-dvh overflow-x-clip">{children}</body>
    </html>
  );
}
