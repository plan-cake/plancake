"use client";

import { useLayoutEffect, useRef } from "react";

import {
  motion,
  MotionValue,
  useMotionValue,
  useTransform,
} from "framer-motion";
import { LayoutDashboardIcon, PlusIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";

// Thickness of the bone ring around the circle, in px
const RING_START = 20;
const RING_END = 100;

interface HeroContentProps {
  /** 0 → 1 as the circle grows from behind the heading to fill the screen. */
  expandProgress: MotionValue<number>;
  restOpacity: MotionValue<number>;
  restY: MotionValue<number>;
}

export default function HeroContent({
  expandProgress,
  restOpacity,
  restY,
}: HeroContentProps) {
  // The circle is rendered at its starting size and grown with transforms
  // instead of animating width/height/border-width, which forced layout and
  // a full repaint on every scroll frame (very choppy on mobile Safari).
  // The bone ring is a separate circle behind the lion one (rather than a
  // border) so its thickness can grow independently of the scale.
  const circleRef = useRef<HTMLDivElement>(null);
  const baseDiameter = useMotionValue(0);
  const vmax = useMotionValue(0);

  useLayoutEffect(() => {
    const update = () => {
      baseDiameter.set(circleRef.current?.offsetWidth ?? 0);
      vmax.set(Math.max(window.innerWidth, window.innerHeight));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [baseDiameter, vmax]);

  // Same geometry as before: the outer diameter grows by 300vmax while the
  // ring grows from RING_START to RING_END.
  const outerDiameter = useTransform(
    [expandProgress, baseDiameter, vmax],
    ([p, d0, v]: number[]) => d0 + p * 3 * v,
  );
  const outerScale = useTransform(
    [outerDiameter, baseDiameter],
    ([d, d0]: number[]) => (d0 ? d / d0 : 1),
  );
  const innerScale = useTransform(
    [outerDiameter, baseDiameter, expandProgress],
    ([d, d0, p]: number[]) => {
      const ring = RING_START + p * (RING_END - RING_START);
      const innerBase = d0 - 2 * RING_START;
      return innerBase > 0 ? (d - 2 * ring) / innerBase : 1;
    },
  );

  return (
    <div className="relative z-10 mx-auto mt-28 max-w-7xl text-center md:mt-16">
      {/* Unified Grid Container for both Tagline and H1 */}
      <div className="relative mx-auto grid w-fit justify-items-center">
        {/* The Expanding Background Circle (Now centered behind both) */}
        <motion.div
          ref={circleRef}
          aria-hidden
          style={{ x: "-50%", y: "-50%", scale: outerScale }}
          className="bg-bone pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[calc(clamp(220px,40vw,320px)*2)] rounded-full will-change-transform"
        />
        <motion.div
          aria-hidden
          style={{ x: "-50%", y: "-50%", scale: innerScale }}
          className="bg-lion pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[calc(clamp(220px,40vw,320px)*2-40px)] rounded-full will-change-transform"
        />

        {/* Base Layer in Grid Cell 1 */}
        <div className="col-start-1 row-start-1 flex flex-col items-center">
          <div className="relative z-10 mb-6 flex justify-center">
            <span className="bg-bone text-violet inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide">
              finally making it out
              <br className="md:hidden" /> of the group chat.
            </span>
          </div>

          <h1 className="relative z-0 mb-10 text-6xl tracking-tight md:mb-4 md:text-8xl">
            <span className="font-display text-accent block">
              stacking up
              <br />
              <span className="text-bone">perfect</span>
              <br />
              <span className="text-bone">plans</span>
            </span>
          </h1>
        </div>
      </div>

      <motion.div
        style={{
          opacity: restOpacity,
          y: restY,
          willChange: "opacity, transform",
        }}
        className="relative z-10"
      >
        <h2 className="text-violet mx-auto mb-4 max-w-2xl text-lg md:text-xl">
          The easiest way to coordinate schedules and plan group events. Stack
          up availability and serve the perfect meeting time.
        </h2>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LinkButton
            buttonStyle="primary"
            icon={<PlusIcon />}
            label="Start Planning"
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
  );
}
