"use client";

import { motion, MotionValue } from "framer-motion";
import { LayoutDashboardIcon, PlusIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";

interface HeroContentProps {
  circleDiameter: MotionValue<string>;
  borderWidth: MotionValue<number>;
  restOpacity: MotionValue<number>;
  restY: MotionValue<number>;
}

export default function HeroContent({
  circleDiameter,
  borderWidth,
  restOpacity,
  restY,
}: HeroContentProps) {
  return (
    <div className="relative z-10 mx-auto mt-28 max-w-7xl text-center md:mt-16">
      {/* Unified Grid Container for both Tagline and H1 */}
      <div className="relative mx-auto grid w-fit justify-items-center">
        {/* The Expanding Background Circle (Now centered behind both) */}
        <motion.div
          aria-hidden
          style={{
            width: circleDiameter,
            height: circleDiameter,
            borderWidth,
            willChange: "width, height, border-width",
          }}
          className="border-bone bg-lion pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-solid"
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
