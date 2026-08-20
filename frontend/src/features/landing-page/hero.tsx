"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { motion, useScroll, useTransform } from "framer-motion";
import { LayoutDashboardIcon, PlusIcon } from "lucide-react";
import Image from "next/image";

import LinkButton from "@/features/button/components/link";

export default function Hero() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const plansMadeRef = useRef<HTMLSpanElement>(null);
  const [clipCenter, setClipCenter] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // 1. Stretched the circle expansion to end at 1.0 instead of 0.75
  const circleScale = useTransform(scrollYProgress, [0.1, 1], [0.085, 1]);
  const clipRadiusVmax = useTransform(scrollYProgress, [0.1, 1], [6, 70]);
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
  const imageY = useTransform(scrollYProgress, [0.2, 1], ["100%", "80%"]);

  return (
    <div className="relative left-1/2 w-[100vw] -translate-x-1/2">
      <div ref={trackRef} className="bg-lion relative z-10 h-[220vh]">
        <div ref={stickyRef} className="sticky top-0 h-screen w-full">
          <div className="bg-background absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
            <motion.div
              aria-hidden
              style={{ scale: circleScale }}
              className="bg-lion ring-bone ring-100 pointer-events-none absolute left-1/2 top-1/2 z-0 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 rounded-full"
            />

            <div className="relative z-10 mx-auto max-w-7xl text-center">
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

                <span className="relative mt-10 block md:mt-0">
                  <motion.span
                    style={{ opacity: stackOpacity, y: stackY }}
                    className="font-display text-bone relative z-10 block text-center text-6xl leading-none tracking-tight md:text-8xl"
                  >
                    stack
                    <br />
                    simple
                  </motion.span>
                </span>
              </h1>

              <motion.div style={{ opacity: restOpacity, y: restY }}>
                <h2 className="text-violet mx-auto mb-4 max-w-2xl text-xl leading-relaxed">
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
            aria-hidden
            style={{ y: imageY }}
            className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto w-[90vw] max-w-[1296px]"
          >
            <Image
              src="/images/hero-image.png"
              alt="Hero Image"
              width={1920}
              height={1080}
              className="pointer-events-none w-full select-none rounded-3xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
      <div className="from-lion to-background relative z-0 w-full bg-gradient-to-b">
        <div
          aria-hidden
          className="pointer-events-none mx-auto w-[90vw] max-w-[1296px]"
        >
          <div className="w-full pb-[70%]" />
        </div>
      </div>
    </div>
  );
}
