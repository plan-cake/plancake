import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Modak, Nunito } from "next/font/google";

import { AccountDetails } from "@/features/account/type";
import Header from "@/features/header/components/header";
import { Providers } from "@/lib/providers";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";
import { serverGet } from "@/lib/utils/api/server-fetch";
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

    // text that appears below your link in search engines
    description: description,

    // keywords for SEO optimization
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

    // for link previews on social media
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

async function checkLoginStatus(): Promise<AccountDetails | null> {
  try {
    const data = await serverGet(ROUTES.auth.checkAccountAuth);
    return {
      email: data.email,
      defaultName: data.default_display_name,
    };
  } catch (e) {
    const error = e as ApiErrorResponse;

    if (error.status === 401 || error.status === 403) {
      return null;
    }

    throw error;
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const accountDetails = await checkLoginStatus();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${modak.variable} ${nunito.variable}`}
    >
      <body className="font-sans antialiased">
        <div className="mx-auto flex min-h-dvh max-w-[1440px] flex-col">
          <Providers accountDetails={accountDetails}>
            <Header />
            {children}
          </Providers>
          <Analytics />
        </div>
      </body>
    </html>
  );
}
