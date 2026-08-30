"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
import { LayoutDashboardIcon, PlusIcon } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";

import SegmentedControl from "@/components/segmented-control";
import LinkButton from "@/features/button/components/link";

type HeroImageView = "specific-dates" | "weekly";
type HeroImageTheme = "light" | "dark";
type HeroImageVariant = { src: string; width: number; height: number };

const HERO_IMAGES: Record<
  HeroImageView,
  Record<"desktop" | "mobile", Record<HeroImageTheme, HeroImageVariant>>
> = {
  "specific-dates": {
    desktop: {
      light: {
        src: "/images/specific-desktop-light.png",
        width: 2880,
        height: 1622,
      },
      dark: {
        src: "/images/specific-desktop-dark.png",
        width: 2880,
        height: 1618,
      },
    },
    mobile: {
      light: {
        src: "/images/specific-mobile-light.png",
        width: 1206,
        height: 2622,
      },
      dark: {
        src: "/images/specific-mobile-dark.png",
        width: 1206,
        height: 2622,
      },
    },
  },
  weekly: {
    desktop: {
      light: {
        src: "/images/weekly-desktop-light.png",
        width: 2880,
        height: 1626,
      },
      dark: {
        src: "/images/weekly-desktop-dark.png",
        width: 2880,
        height: 1622,
      },
    },
    mobile: {
      light: {
        src: "/images/weekly-mobile-light.png",
        width: 1206,
        height: 2622,
      },
      dark: {
        src: "/images/weekly-mobile-dark.png",
        width: 1206,
        height: 2622,
      },
    },
  },
};

export default function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const plansMadeRef = useRef<HTMLSpanElement>(null);
  const [clipCenter, setClipCenter] = useState({ x: 0, y: 0 });
  const [heroImageView, setHeroImageView] =
    useState<HeroImageView>("specific-dates");

  // Avoids a hydration mismatch: resolvedTheme is unknown on the server, so
  // fall back to light until mounted on the client.
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const heroImageTheme: HeroImageTheme =
    mounted && resolvedTheme === "dark" ? "dark" : "light";

  const desktopImage = HERO_IMAGES[heroImageView].desktop[heroImageTheme];
  const mobileImage = HERO_IMAGES[heroImageView].mobile[heroImageTheme];

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // 1. Stretched the circle expansion to end at 1.0 instead of 0.75
  const circleScale = useTransform(scrollYProgress, [0.1, 1], [0.035, 1]);

  // Clip-path wipe for the accent text, synced to the growing circle behind
  // it. Narrowed to [0.1, 0.35] (vs. the circle's full [0.1, 1]) since the
  // 70vmax max radius already fully covers the text well before progress
  // hits 1 — this keeps clip-path (expensive to repaint, not GPU-composited)
  // live for only a short slice of the scroll instead of the whole track.
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

  // 2. Adjusted text timings slightly to flow naturally within the new timeline
  const stackOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const stackY = useTransform(scrollYProgress, [0.2, 0.5], [24, 0]);
  const restOpacity = useTransform(scrollYProgress, [0.4, 0.8], [0, 1]);
  const restY = useTransform(scrollYProgress, [0.4, 0.8], [24, 0]);

  // 3. Image now finishes moving exactly at 1.0, handing off perfectly to the native scroll
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

            <div className="relative z-10 mx-auto mt-28 max-w-7xl text-center md:mt-16">
              <div className="mb-6 flex justify-center">
                <span className="bg-bone text-violet inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide">
                  finally making it outta the group chat.
                </span>
              </div>

              <h1 className="mb-10 md:mb-4">
                <span
                  ref={plansMadeRef}
                  className="relative block text-5xl tracking-tight md:text-8xl"
                >
                  <span className="font-display text-foreground block">
                    plans made
                  </span>
                  <motion.span
                    aria-hidden
                    style={{ clipPath }}
                    className="font-display text-accent pointer-events-none absolute inset-0 block"
                  >
                    plans made
                  </motion.span>
                </span>

                <span className="relative mt-0 block">
                  <motion.span
                    style={{
                      opacity: stackOpacity,
                      y: stackY,
                      willChange: "opacity, transform",
                    }}
                    className="font-display text-bone relative z-10 block text-center text-5xl leading-none tracking-tight md:text-8xl"
                  >
                    stack
                    <br />
                    simple
                  </motion.span>
                </span>
              </h1>

              <motion.div
                style={{
                  opacity: restOpacity,
                  y: restY,
                  willChange: "opacity, transform",
                }}
              >
                <h2 className="text-violet mx-auto mb-4 max-w-2xl text-lg md:text-xl">
                  The easiest way to coordinate schedules and plan group events.
                  Stack up availability and serve the perfect meeting time.
                </h2>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <LinkButton
                    buttonStyle="primary"
                    icon={<PlusIcon />}
                    label="Mix Your First Plan"
                    href="/new-event"
                  />
                  <LinkButton
                    buttonStyle="secondary"
                    icon={<LayoutDashboardIcon />}
                    label="View Dashboard"
                    href="/dashboard"
                    className="text-violet"
                  />
                </div>
              </motion.div>
            </div>
          </div>

          <motion.div
            style={{
              y: imageY,
              willChange: "transform",
              transform: "translateZ(0)",
            }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto w-[90vw] max-w-[1296px]"
          >
            <div className="pointer-events-auto relative z-10 mx-auto mb-4 w-64">
              <SegmentedControl
                options={[
                  { label: "Specific Dates", value: "specific-dates" },
                  { label: "Weekly", value: "weekly" },
                ]}
                value={heroImageView}
                onChange={setHeroImageView}
                className="bg-background shadow-lg"
              />
            </div>

            <div
              className="relative hidden w-full md:block"
              style={{
                aspectRatio: `${desktopImage.width} / ${desktopImage.height}`,
              }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={heroImageView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    aria-hidden
                    src={desktopImage.src}
                    alt="Hero Image"
                    fill
                    sizes="90vw"
                    className="pointer-events-none select-none rounded-3xl object-cover shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
            <div
              className="relative mx-auto block w-3/5 max-w-[260px] md:hidden"
              style={{
                aspectRatio: `${mobileImage.width} / ${mobileImage.height}`,
              }}
            >
              <AnimatePresence initial={false}>
                <motion.div
                  key={heroImageView}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    aria-hidden
                    src={mobileImage.src}
                    alt="Hero Image"
                    fill
                    sizes="60vw"
                    className="pointer-events-none select-none rounded-3xl object-cover shadow-2xl"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="from-lion to-background relative z-0 w-full bg-gradient-to-b">
        <div
          aria-hidden
          className="pointer-events-none mx-auto w-[90vw] max-w-[1296px]"
        >
          <div className="aspect-[1/1.25] w-full sm:aspect-square md:aspect-[2/1]" />
        </div>
      </div>
    </div>
  );
}
