import { Suspense } from "react";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Modak, Nunito } from "next/font/google";

import { CookieGuard } from "@/components/cookie-guard";
import SkipToContentButton from "@/components/skip-to-content-button";
import Header from "@/features/header/components/header";
import ToastListener from "@/features/system-feedback/toast/listener";
import { Providers } from "@/lib/providers";
import "@/styles/globals.css";

const modak = Modak({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-modak",
  display: "swap",
});

const nunito = Nunito({
  weight: ["200", "300", "400", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const description =
    "Stacking up perfect plans has never been easier. Plancake is the simplest way to coordinate availability and schedule group meetings for free.";

  return {
    title: "Plancake - Stacking up perfect plans",
    description: description,
    keywords: [
      "Plancake",
      "scheduling",
      "meeting finder",
      "availability poll",
      "group scheduling tool",
      "event planner",
      "event planning",
      "free scheduling app",
      "find a time to meet",
      "When2meet",
      "Doodle",
      "mobile friendly scheduler",
    ],
    appleWebApp: {
      title: "Plancake",
    },
    openGraph: {
      title: "Plancake - Stacking up perfect plans",
      description: description,
      type: "website",
      locale: "en_US",
      url: "https://plancake.org",
      siteName: "Plancake",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${modak.variable} ${nunito.variable}`}
    >
      <body className="font-sans antialiased">
        <div className="relative w-full overflow-x-clip">
          <div className="mx-auto flex min-h-dvh w-full max-w-[1440px] flex-col">
            <SkipToContentButton />
            <Providers>
              <CookieGuard>
                <Suspense fallback={null}>
                  <ToastListener />
                </Suspense>
                <Header />
                {/* The main content is wrapped to allow skip to content functionality. */}
                <div id="main-content" className="outline-hidden">
                  {children}
                </div>
              </CookieGuard>
            </Providers>
            <Analytics />
          </div>
        </div>
      </body>
    </html>
  );
}
