"use client";

import { useEffect, useState } from "react";

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
  const [orbitScale, setOrbitScale] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
          <div className="text-background/70 text-sm">{config.description}</div>
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
        onSelect={() => setActiveStep(config.step)}
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
        <h2 className="font-display text-foreground text-5xl tracking-wide md:text-6xl">
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
        description={activeDrawerStep?.description ?? ""}
        contentClassName="h-fit"
      >
        {activeDrawerStep && (
          <div className="flex flex-col gap-4">
            <p className="text-foreground/70 text-center">
              {activeDrawerStep.description}
            </p>
            {getStepBody(activeDrawerStep.step)}
          </div>
        )}
      </FloatingDrawer>
    </div>
  );
}
