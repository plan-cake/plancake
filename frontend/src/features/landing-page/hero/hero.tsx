"use client";

import { useEffect, useState } from "react";

import { ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";

import { HeroImageTheme } from "@/features/landing-page/hero/config";
import HeroContent from "@/features/landing-page/hero/content";
import HeroImage from "@/features/landing-page/hero/image";

export default function Hero() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const heroImageTheme: HeroImageTheme =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  return (
    <div className="relative left-1/2 w-[100vw] -translate-x-1/2">
      <div className="hero-track bg-background relative z-10 h-[250vh]">
        <div className="sticky top-0 h-screen w-full">
          <div className="bg-background absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
            <HeroContent />

            <div className="hero-arrow pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2">
              <div className="text-foreground flex animate-bounce flex-col items-center">
                <span className="text-foreground/70 text-sm font-semibold tracking-wide">
                  Scroll!
                </span>
                <ChevronDown className="h-6 w-6" />
              </div>
            </div>
          </div>

          <HeroImage theme={heroImageTheme} />
        </div>
      </div>
      <div className="from-lion to-background relative z-0 w-full bg-gradient-to-b">
        <div
          aria-hidden
          className="pointer-events-none mx-auto w-[90vw] max-w-[1296px]"
        >
          <div className="h-24 md:h-0" />
          <div className="aspect-[1/1.25] w-full md:aspect-[2/1.125]" />
        </div>
      </div>
    </div>
  );
}
