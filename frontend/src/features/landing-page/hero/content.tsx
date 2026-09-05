"use client";

import { motion, MotionValue } from "framer-motion";
import { LayoutDashboardIcon, PlusIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";

interface HeroContentProps {
  clipPath: MotionValue<string>;
  stackOpacity: MotionValue<number>;
  stackY: MotionValue<number>;
  restOpacity: MotionValue<number>;
  restY: MotionValue<number>;
  plansMadeRef: React.RefObject<HTMLSpanElement | null>;
}

export default function HeroContent({
  clipPath,
  stackOpacity,
  stackY,
  restOpacity,
  restY,
  plansMadeRef,
}: HeroContentProps) {
  return (
    <div className="relative z-10 mx-auto mt-28 max-w-7xl text-center md:mt-16">
      <div className="mb-6 flex justify-center">
        <span className="bg-bone text-violet inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold tracking-wide">
          finally making it out of the group chat.
        </span>
      </div>

      <h1 className="mb-10 md:mb-4">
        <span
          ref={plansMadeRef}
          className="relative block text-5xl tracking-tight md:text-8xl"
        >
          <span className="font-display text-foreground block">
            stacking up
          </span>
          <motion.span
            aria-hidden
            style={{ clipPath }}
            className="font-display text-accent pointer-events-none absolute inset-0 block"
          >
            stacking up
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
            perfect
            <br />
            plans
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
