"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { motion, useScroll, useTransform } from "framer-motion";
import { useTheme } from "next-themes";

import { HeroImageTheme } from "@/features/landing-page/hero/config";
import HeroContent from "@/features/landing-page/hero/content";
import HeroImage from "@/features/landing-page/hero/image";

export default function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const plansMadeRef = useRef<HTMLSpanElement>(null);
  const [clipCenter, setClipCenter] = useState({ x: 0, y: 0 });

  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const heroImageTheme: HeroImageTheme =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const circleScale = useTransform(scrollYProgress, [0.1, 1], [0.035, 1]);
  const clipRadiusVmax = useTransform(scrollYProgress, [0.1, 1], [3.5, 100]);
  const clipPath = useTransform(
    clipRadiusVmax,
    (r) => `circle(${r}vmax at ${clipCenter.x}px ${clipCenter.y}px)`,
  );

  useLayoutEffect(() => {
    const measure = () => {
      if (!stickyRef.current || !plansMadeRef.current) return;
      const stickyRect = stickyRef.current.getBoundingClientRect();
      const textRect = plansMadeRef.current.getBoundingClientRect();
      setClipCenter({
        x: stickyRect.left + stickyRect.width / 2 - textRect.left,
        y: stickyRect.top + stickyRect.height / 2 - textRect.top,
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const stackOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const stackY = useTransform(scrollYProgress, [0.2, 0.5], [24, 0]);
  const restOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);
  const restY = useTransform(scrollYProgress, [0.4, 0.8], [24, 0]);
  const imageY = useTransform(scrollYProgress, [0.2, 1], ["110%", "90%"]);

  return (
    <div className="relative left-1/2 w-[100vw] -translate-x-1/2">
      <div ref={trackRef} className="bg-lion relative z-10 h-[220vh]">
        <div ref={stickyRef} className="sticky top-0 h-screen w-full">
          <div className="bg-background absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
            <motion.div
              aria-hidden
              style={{ scale: circleScale, willChange: "transform" }}
              className="bg-lion border-bone pointer-events-none absolute left-1/2 top-1/2 z-0 h-[200vmax] w-[200vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border-[100px]"
            />

            <HeroContent
              clipPath={clipPath}
              stackOpacity={stackOpacity}
              stackY={stackY}
              restOpacity={restOpacity}
              restY={restY}
              plansMadeRef={plansMadeRef}
            />
          </div>

          <HeroImage imageY={imageY} theme={heroImageTheme} />
        </div>
      </div>
      <div className="from-lion to-background relative z-0 w-full bg-gradient-to-b">
        <div
          aria-hidden
          className="pointer-events-none mx-auto w-[90vw] max-w-[1296px]"
        >
          <div className="aspect-[1/1.25] w-full sm:aspect-square md:aspect-[2/1.125]" />
        </div>
      </div>
    </div>
  );
}
