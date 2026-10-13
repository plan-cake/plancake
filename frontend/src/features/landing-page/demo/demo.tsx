"use client";

import { useEffect, useState, useRef } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { FloatingDrawer } from "@/features/drawer";
import { DEMO_STEPS_CONFIG } from "@/features/landing-page/demo/config";
import OrbitImages from "@/features/landing-page/demo/orbit-images";
import OrbitNode from "@/features/landing-page/demo/orbit-node";
import PaintAvailabilityStep from "@/features/landing-page/demo/paint-step";
import ViewResultsStep from "@/features/landing-page/demo/results-step";
import {
  PARTICIPANTS,
  INITIAL_AVAILABILITIES,
} from "@/features/landing-page/demo/utils";
import { cn } from "@/lib/utils/classname";

export default function HowItWorksSection() {
  const [userAvailability, setUserAvailability] = useState<Set<string>>(
    new Set(),
  );
  const [availabilities, setAvailabilities] = useState<
    Record<string, string[]>
  >(INITIAL_AVAILABILITIES);
  const [currentlyAvailable, setCurrentlyAvailable] =
    useState<string[]>(PARTICIPANTS);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);
  const [allowSubmit, setAllowSubmit] = useState(false);

  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);
  const [orbitScale, setOrbitScale] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const changeStep = (newStep: number) => {
    if (activeStep !== null) {
      setDirection(newStep > activeStep ? 1 : -1);
    }
    setActiveStep(newStep);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (activeStep !== null) {
      if (
        distance > minSwipeDistance &&
        activeStep < DEMO_STEPS_CONFIG.length
      ) {
        changeStep(activeStep + 1);
      } else if (distance < -minSwipeDistance && activeStep > 1) {
        changeStep(activeStep - 1);
      }
    }
  };

  const paintSlot = (slotIso: string, togglingOn: boolean) => {
    setUserAvailability((prev) => {
      const newSet = new Set(prev);
      if (togglingOn) {
        newSet.add(slotIso);
      } else {
        newSet.delete(slotIso);
      }
      return newSet;
    });
    setAllowSubmit(true);
  };

  const handleAvailabilitySubmit = () => {
    const you = PARTICIPANTS[3];

    setAvailabilities((prev) => {
      const nextAvailabilities: Record<string, string[]> = {};
      for (const slotIso of Object.keys(prev)) {
        if (userAvailability.has(slotIso)) {
          if (!prev[slotIso].includes(you)) {
            nextAvailabilities[slotIso] = [...prev[slotIso], you];
          } else {
            nextAvailabilities[slotIso] = prev[slotIso];
          }
        } else {
          nextAvailabilities[slotIso] = prev[slotIso].filter((p) => p !== you);
        }
      }
      return nextAvailabilities;
    });

    setAllowSubmit(false);
  };

  const handleResultsHover = (slotIso: string | null) => {
    setHoveredSlot(slotIso);
    if (slotIso) {
      setCurrentlyAvailable(availabilities[slotIso] || []);
    } else {
      setCurrentlyAvailable(PARTICIPANTS);
    }
  };

  const getStepBody = (stepNumber: number) => {
    switch (stepNumber) {
      case 3:
        return (
          <PaintAvailabilityStep
            userAvailability={userAvailability}
            onToggleSlot={paintSlot}
            onSubmit={handleAvailabilitySubmit}
            allowSubmit={allowSubmit}
          />
        );
      case 4:
        return (
          <ViewResultsStep
            availabilities={availabilities}
            hoveredSlot={hoveredSlot}
            onHoverSlot={handleResultsHover}
            currentlyAvailable={currentlyAvailable}
          />
        );
      default:
        return null;
    }
  };

  const orbitNodes = [...DEMO_STEPS_CONFIG].reverse().map((config) => {
    const body = getStepBody(config.step);

    const hoverCard = (
      <div className="w-full p-4">
        <div className={cn("text-center", body && "mb-4")}>
          <div className="text-lg font-bold">{config.title}</div>
          <div className="text-background/70">{config.description}</div>
        </div>
        {body}
      </div>
    );

    return (
      <OrbitNode
        key={config.step}
        stepNumber={config.step}
        label={config.label}
        hoverCard={hoverCard}
        onSelect={() => changeStep(config.step)}
        orbitScale={orbitScale}
        openAbove={config.openAbove}
      />
    );
  });

  const activeDrawerStep =
    activeStep !== null
      ? DEMO_STEPS_CONFIG.find((s) => s.step === activeStep)
      : null;

  return (
    <div className="bg-panel rounded-4xl flex flex-col overflow-visible p-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
        <h2 className="text-foreground font-display text-5xl tracking-wide md:text-6xl">
          the perfect recipe
        </h2>
        <div className="text-foreground/80 max-w-md text-lg md:text-xl">
          <p>
            Four simple steps to coordinate your next group event without the
            messy back-and-forth.
          </p>
          <p className="text-foreground mt-2 text-sm font-semibold md:text-lg">
            Try it out by <span className="max-md:hidden">hovering over</span>
            <span className="md:hidden">tapping</span> the steps below!
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex w-full items-center justify-center">
        <div className="mx-auto w-full max-w-[900px]">
          <OrbitImages
            images={orbitNodes}
            shape="ellipse"
            baseWidth={900}
            radiusX={300}
            radiusY={isMobile ? 320 : 230}
            rotation={-20}
            duration={45}
            itemSize={160}
            responsive={true}
            onScaleChange={setOrbitScale}
            direction="normal"
            fill
            showPath
            paused={true}
            pathColor="currentColor"
            className="text-foreground/75"
          />
        </div>
      </div>

      <div className="flex-shrink-0" />

      <FloatingDrawer
        title={activeDrawerStep?.title ?? ""}
        open={activeStep !== null}
        onOpenChange={(open) => !open && setActiveStep(null)}
        description=""
        contentClassName="h-fit overflow-hidden"
      >
        <div className="flex flex-col">
          {/* Swipeable Step Content Area */}
          <div
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence
              mode="popLayout"
              initial={false}
              custom={direction}
            >
              {activeDrawerStep && (
                <motion.div
                  key={activeDrawerStep.step}
                  custom={direction}
                  variants={{
                    enter: (dir: number) => ({
                      x: dir > 0 ? 100 : -100,
                      opacity: 0,
                    }),
                    center: { x: 0, opacity: 1 },
                    exit: (dir: number) => ({
                      x: dir > 0 ? -100 : 100,
                      opacity: 0,
                    }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="flex flex-col gap-4"
                >
                  <p className="text-foreground/70 text-center">
                    {activeDrawerStep.description}
                  </p>
                  {getStepBody(activeDrawerStep.step)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Morphing Step Indicators */}
          <div className="mt-4 flex items-center justify-center gap-2 pb-2">
            {DEMO_STEPS_CONFIG.map((config) => {
              const isActive = activeStep === config.step;
              return (
                <button
                  key={config.step}
                  onClick={() => changeStep(config.step)}
                  aria-label={`Go to step ${config.step}`}
                  className="relative flex h-4 items-center justify-center"
                >
                  <motion.div
                    layout
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                      "h-2 rounded-full",
                      isActive
                        ? "bg-foreground w-6"
                        : "bg-foreground/20 hover:bg-foreground/40 w-2",
                    )}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </FloatingDrawer>
    </div>
  );
}
