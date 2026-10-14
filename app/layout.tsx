import type { Metadata, Viewport } from "next";
import { Google_Sans_Flex, Google_Sans_Code } from "next/font/google";
import { DESCRIPTION, GITHUB, NAME, SITE_URL, TITLE } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next";
import { PointerFX } from "@/components/PointerFX";
import "./globals.css";

const display = Google_Sans_Flex({ subsets: ["latin"], variable: "--font-gsf", display: "swap", axes: ["GRAD", "ROND"] });
const mono = Google_Sans_Code({ subsets: ["latin"], variable: "--font-gsc", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s · ${NAME}` },
  description: DESCRIPTION,
  applicationName: NAME,
  authors: [{ name: NAME, url: GITHUB }],
  creator: NAME,
  keywords: ["n1th1n", "portfolio", "Android", "Kotlin", "Flutter", "VS Code extension", "Rust", "Linux", "GitHub client", "Daybloom", "Forqen", "RTMON"],
  alternates: { canonical: "/", types: { "application/rss+xml": [{ url: "/feed.xml", title: `${NAME} · Updates` }] } },
  openGraph: { type: "website", url: "/", siteName: NAME, title: TITLE, description: DESCRIPTION, locale: "en_US" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  colorScheme: "dark",
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        {children}
        <PointerFX />
        <Analytics />
      </body>
    </html>
  );
}
