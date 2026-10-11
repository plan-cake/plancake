"use client";

import { useEffect, useRef, useState } from "react";

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useTheme } from "next-themes";

import { HeroImageTheme } from "@/features/landing-page/hero/config";
import HeroContent from "@/features/landing-page/hero/content";
import HeroImage from "@/features/landing-page/hero/image";

export default function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const heroImageTheme: HeroImageTheme =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const expandProgress = useTransform(scrollYProgress, [0.1, 1], [0, 1]);

  // CSS clamp handles the responsive starting radius without any post-paint JS measuring!
  // Mobile text-5xl width is ~300px (160px radius).
  // Desktop text-8xl width is ~600px (320px radius).
  const clipPath = useMotionTemplate`circle(calc(clamp(220px, 40vw, 320px) + ${expandProgress} * 150vmax) at 50% 50%)`;
  const circleDiameter = useMotionTemplate`calc((clamp(220px, 40vw, 320px) * 2) + ${expandProgress} * 300vmax)`;

  const restOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);
  const restY = useTransform(scrollYProgress, [0.5, 0.8], [24, 0]);
  const imageY = useTransform(scrollYProgress, [0.2, 1], ["110%", "90%"]);
  const arrowOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const borderWidth = useTransform(scrollYProgress, [0.1, 1], [20, 100]);

  return (
    <div className="relative left-1/2 w-[100vw] -translate-x-1/2">
      <div ref={trackRef} className="bg-lion relative z-10 h-[250vh]">
        <div className="sticky top-0 h-screen w-full">
          <div className="bg-background absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
            <HeroContent
              clipPath={clipPath}
              circleDiameter={circleDiameter}
              borderWidth={borderWidth}
              restOpacity={restOpacity}
              restY={restY}
            />

            <motion.div
              style={{ opacity: arrowOpacity }}
              className="text-foreground pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 animate-bounce flex-col items-center"
            >
              <span className="text-foreground/70 text-sm font-semibold tracking-wide">
                Scroll!
              </span>
              <ChevronDown className="h-6 w-6" />
            </motion.div>
          </div>

          <HeroImage imageY={imageY} theme={heroImageTheme} />
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
