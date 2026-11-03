"use client";

import { useLayoutEffect, useRef } from "react";

import { LayoutDashboardIcon, PlusIcon } from "lucide-react";

import LinkButton from "@/features/button/components/link";

// Thickness of the bone ring around the circle, in px
const RING_START = 20;
const RING_END = 100;

export default function HeroContent() {
  // The circles grow with scale (see hero-scroll.css) rather than resizing, which
  // would repaint every frame. The ring is a separate circle so it can grow too.
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    let lastWidth = 0;
    const update = () => {
      // iOS Safari fires resize events as its toolbar shows and hides while scrolling,
      // which changes innerHeight and would make the circle jump mid-scroll. Only
      // re-measure when the width changes (e.g. a real resize or rotation).
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;

      const container = containerRef.current;
      const d0 = circleRef.current?.offsetWidth ?? 0;
      if (!container || !d0) return;

      // The outer diameter grows by 300vmax while the ring grows from RING_START to
      // RING_END. These are the end scales the CSS animations grow the circles to.
      const outerEnd = d0 + 3 * Math.max(window.innerWidth, window.innerHeight);
      container.style.setProperty(
        "--hero-outer-scale-end",
        String(outerEnd / d0),
      );
      container.style.setProperty(
        "--hero-inner-scale-end",
        String((outerEnd - 2 * RING_END) / (d0 - 2 * RING_START)),
      );
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <div className="relative z-10 mx-auto mt-28 max-w-7xl text-center md:mt-16">
      <div
        ref={containerRef}
        className="relative mx-auto grid w-fit justify-items-center"
      >
        <div
          ref={circleRef}
          aria-hidden
          className="hero-circle-outer bg-bone -translate-1/2 pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[calc(clamp(220px,40vw,320px)*2)] rounded-full will-change-transform"
        />
        <div
          aria-hidden
          className="hero-circle-inner bg-lion -translate-1/2 pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[calc(clamp(220px,40vw,320px)*2-40px)] rounded-full will-change-transform"
        />

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

      <div className="hero-rest relative z-10 will-change-[opacity,translate]">
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
      </div>
    </div>
  );
}
