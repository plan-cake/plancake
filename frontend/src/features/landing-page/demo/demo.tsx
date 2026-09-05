"use client";

import { useEffect, useState } from "react";

import { FloatingDrawer } from "@/features/drawer";
import OrbitImages from "@/features/landing-page/demo/orbit-images";
import OrbitNode from "@/features/landing-page/demo/orbit-node";
import PaintAvailabilityStep from "@/features/landing-page/demo/paint-step";
import ViewResultsStep from "@/features/landing-page/demo/results-step";
import {
  PARTICIPANTS,
  INITIAL_AVAILABILITIES,
} from "@/features/landing-page/utils";
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

  const STEPS_CONFIG = [
    {
      step: 1,
      label: "Create Event",
      title: "Create Your Event",
      description: "Pick a range of dates and times you think might work.",
      body: null,
    },
    {
      step: 2,
      label: "Share Link",
      title: "Share with Your Friends",
      description: "Anyone can join from the event link, no account required.",
      body: null,
    },
    {
      step: 3,
      label: "Add Availability",
      title: "Paint Your Availability",
      description:
        "Try it here! Click and drag on the grid to fill in the times you're free.",
      body: (
        <PaintAvailabilityStep
          userAvailability={userAvailability}
          onToggleSlot={paintSlot}
          onSubmit={handleAvailabilitySubmit}
          allowSubmit={allowSubmit}
        />
      ),
    },
    {
      step: 4,
      label: "View Results",
      title: "Watch the Results Stack Up",
      description:
        "See which times work best for everyone as soon as they respond.",
      body: (
        <ViewResultsStep
          availabilities={availabilities}
          hoveredSlot={hoveredSlot}
          onHoverSlot={handleResultsHover}
          currentlyAvailable={currentlyAvailable}
        />
      ),
    },
  ];

  const orbitNodes = [...STEPS_CONFIG].reverse().map((config) => {
    const hoverCard = (
      <div className="w-full p-4">
        <div className={cn("text-center", config.body && "mb-4")}>
          <div className="text-lg font-bold">{config.title}</div>
          <div className="text-background/70 text-sm">{config.description}</div>
        </div>
        {config.body}
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
        openAbove={config.step === 3}
      />
    );
  });

  const activeDrawerStep =
    activeStep !== null
      ? STEPS_CONFIG.find((s) => s.step === activeStep)
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
            {activeDrawerStep.body}
          </div>
        )}
      </FloatingDrawer>
    </div>
  );
}
