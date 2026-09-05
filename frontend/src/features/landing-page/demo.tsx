"use client";

import { useEffect, useRef, useState } from "react";

import ActionButton from "@/features/button/components/action";
import { FloatingDrawer } from "@/features/drawer";
import ScheduleGrid from "@/features/event/grid/grid";
import ParticipantChip from "@/features/event/results/attendees/participant-chip";
import OrbitImages from "@/features/landing-page/orbit-images";
import {
  PARTICIPANTS,
  TIMESLOTS,
  INITIAL_AVAILABILITIES,
} from "@/features/landing-page/utils";
import { cn } from "@/lib/utils/classname";

const BASE_FONT_PX = 16;
const MIN_FONT_PX = 12;

function OrbitNode({
  stepNumber,
  label,
  hoverCard,
  onSelect,
  orbitScale,
  openAbove = false,
}: {
  stepNumber: number;
  label: string;
  hoverCard: React.ReactNode;
  onSelect: () => void;
  orbitScale: number | null;
  openAbove?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [opensLeft, setOpensLeft] = useState(false);

  const handleMouseEnter = () => {
    if (openAbove) return;
    if (containerRef.current) {
      // Get the pill's bounding box
      const rect = containerRef.current.getBoundingClientRect();
      // The card width is 576px. We check if the pill's right edge + card width
      // exceeds the viewport width (with a small 20px safety buffer).
      if (rect.right + 576 + 20 > window.innerWidth) {
        setOpensLeft(true);
      } else {
        setOpensLeft(false);
      }
    }
  };

  const counterScale =
    orbitScale && orbitScale > 0
      ? Math.max(1, MIN_FONT_PX / (BASE_FONT_PX * orbitScale))
      : 1;

  return (
    <div
      ref={containerRef}
      className="group relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
    >
      <button
        onClick={() => {
          // Devices that can't hover (touch) get a drawer instead; hover
          // devices already have the popout below.
          if (!window.matchMedia("(hover: hover)").matches) {
            onSelect();
          }
        }}
        style={
          counterScale !== 1
            ? { transform: `scale(${counterScale})`, transformOrigin: "center" }
            : undefined
        }
        className={cn(
          "bg-lion hover:ring-10 hover:ring-bone/50 text-violet hover:cursor-pointer",
          "flex items-center gap-2 whitespace-nowrap rounded-full px-2 py-2 pr-3 font-semibold",
          "hover:cursor-pointer",
        )}
      >
        <div
          className={cn(
            "bg-accent text-base font-bold text-white",
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          )}
        >
          {stepNumber}
        </div>
        {label}
      </button>

      <div
        className={cn(
          "w-xl pointer-events-none absolute opacity-0 transition-all duration-300 ease-out hover:z-50 group-hover:pointer-events-auto group-hover:opacity-100",
          openAbove
            ? "bottom-[110%] left-1/2 origin-bottom -translate-x-1/2 scale-95 group-hover:scale-100"
            : cn(
                "top-1/2 -translate-y-1/2",
                opensLeft
                  ? "right-[110%] origin-right scale-95 group-hover:scale-100"
                  : "left-[110%] origin-left scale-95 group-hover:scale-100",
              ),
        )}
      >
        <div className="bg-foreground text-background overflow-hidden rounded-3xl shadow-2xl">
          {hoverCard}
        </div>
      </div>
    </div>
  );
}

export default function Demo() {
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
          // Create a new array when adding a participant
          if (!prev[slotIso].includes(you)) {
            nextAvailabilities[slotIso] = [...prev[slotIso], you];
          } else {
            nextAvailabilities[slotIso] = prev[slotIso]; // Unchanged
          }
        } else {
          // .filter() automatically returns a new array
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
      setCurrentlyAvailable(availabilities[slotIso]);
    } else {
      setCurrentlyAvailable(PARTICIPANTS);
    }
  };

  const step1 = (
    <div key="step1" className="p-4 text-center">
      <div className="mb-2 text-lg font-bold">Create Your Event</div>
      <div className="text-background/70 text-sm">
        Pick a range of dates and times you think might work.
      </div>
    </div>
  );

  const step2 = (
    <div key="step2" className="p-4 text-center">
      <div className="mb-2 text-lg font-bold">Share with Your Friends</div>
      <div className="text-background/70 text-sm">
        Anyone can join from the event link, no account required.
      </div>
    </div>
  );

  const step3 = (
    <div key="step3" className="p-4">
      <div className="mb-4 text-center">
        <div className="text-lg font-bold">Paint Your Availability</div>
        <div className="text-background/70 text-sm">
          Click and drag on the grid to fill in the times you&apos;re free. Try
          it here!
        </div>
      </div>
      <div className="bg-background text-foreground rounded-2xl p-4">
        <ScheduleGrid
          mode="paint"
          viewTransitionName="none"
          staticHeader
          timeslots={TIMESLOTS}
          timezone="America/New_York"
          userAvailability={userAvailability}
          onToggleSlot={paintSlot}
        />
        <div className="flex items-center justify-center">
          <ActionButton
            buttonStyle="primary"
            label="Submit"
            onClick={handleAvailabilitySubmit}
            disabled={!allowSubmit}
          />
        </div>
      </div>
    </div>
  );

  const step4 = (
    <div key="step4" className="w-full p-4">
      <div className="mb-4 text-center">
        <div className="text-lg font-bold">Watch the Results Stack Up</div>
        <div className="text-background/70 text-sm">
          See which times work best for everyone as soon as they respond.
        </div>
      </div>
      <div className="bg-background text-foreground rounded-2xl p-4">
        <ScheduleGrid
          mode="view"
          viewTransitionName="none"
          staticHeader
          timeslots={TIMESLOTS}
          timezone="America/New_York"
          availabilities={availabilities}
          numParticipants={4}
          hoveredSlot={hoveredSlot}
          setHoveredSlot={handleResultsHover}
        />
        <div className="pointer-events-none flex flex-wrap items-center justify-center gap-2 px-2">
          {PARTICIPANTS.map((p) => (
            <ParticipantChip
              key={p}
              areSelected={false}
              includedInSlider={false}
              index={0}
              isAvailable={currentlyAvailable.includes(p)}
              isRemoving={false}
              isSelected={false}
              onClick={() => {}}
              onHoverChange={() => {}}
              onRemove={() => {}}
              person={p}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // Ordered so that, combined with rotation={0} below, stepNumber 1 lands at
  // 12 o'clock and the rest read clockwise (1 → 2 → 3 → 4).
  const orbitNodes = [
    <OrbitNode
      key="4"
      stepNumber={4}
      label="View Results"
      hoverCard={step4}
      onSelect={() => setActiveStep(4)}
      orbitScale={orbitScale}
    />,
    <OrbitNode
      key="3"
      stepNumber={3}
      label="Add Availability"
      hoverCard={step3}
      onSelect={() => setActiveStep(3)}
      orbitScale={orbitScale}
      openAbove
    />,
    <OrbitNode
      key="2"
      stepNumber={2}
      label="Share Link"
      hoverCard={step2}
      onSelect={() => setActiveStep(2)}
      orbitScale={orbitScale}
    />,
    <OrbitNode
      key="1"
      stepNumber={1}
      label="Create Event"
      hoverCard={step1}
      onSelect={() => setActiveStep(1)}
      orbitScale={orbitScale}
    />,
  ];

  // Drawer versions of the same four steps for touch devices, which can't
  // hover to see the popout above. Same content, but with normal (not
  // color-inverted) text since the drawer isn't a dark bubble.
  const DRAWER_STEPS: Record<
    number,
    { title: string; description: string; body?: React.ReactNode }
  > = {
    1: {
      title: "Create Your Event",
      description: "Pick a range of dates and times you think might work.",
    },
    2: {
      title: "Share with Your Friends",
      description: "Anyone can join from the event link, no account required.",
    },
    3: {
      title: "Paint Your Availability",
      description:
        "Try it here! Click and drag on the grid to fill in the times you're free.",
      body: (
        <div className="bg-background text-foreground rounded-2xl p-4">
          <ScheduleGrid
            mode="paint"
            viewTransitionName="none"
            staticHeader
            timeslots={TIMESLOTS}
            timezone="America/New_York"
            userAvailability={userAvailability}
            onToggleSlot={paintSlot}
          />
          <div className="flex items-center justify-center pt-2">
            <ActionButton
              buttonStyle="primary"
              label="Submit"
              onClick={handleAvailabilitySubmit}
              disabled={!allowSubmit}
            />
          </div>
        </div>
      ),
    },
    4: {
      title: "Watch the Results Stack Up",
      description:
        "See which times work best for everyone as soon as they respond.",
      body: (
        <div className="bg-background text-foreground rounded-2xl p-4">
          <ScheduleGrid
            mode="view"
            viewTransitionName="none"
            staticHeader
            timeslots={TIMESLOTS}
            timezone="America/New_York"
            availabilities={availabilities}
            numParticipants={4}
            hoveredSlot={hoveredSlot}
            setHoveredSlot={handleResultsHover}
          />
          <div className="pointer-events-none flex flex-wrap items-center justify-center gap-2 px-2 pt-2">
            {PARTICIPANTS.map((p) => (
              <ParticipantChip
                key={p}
                areSelected={false}
                includedInSlider={false}
                index={0}
                isAvailable={currentlyAvailable.includes(p)}
                isRemoving={false}
                isSelected={false}
                onClick={() => {}}
                onHoverChange={() => {}}
                onRemove={() => {}}
                person={p}
              />
            ))}
          </div>
        </div>
      ),
    },
  };

  const activeDrawerStep =
    activeStep !== null ? DRAWER_STEPS[activeStep] : null;

  return (
    <div className="bg-panel rounded-4xl flex flex-col overflow-visible p-12">
      {/* Text Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-6">
        <h2 className="font-display text-foreground text-5xl tracking-wide md:text-6xl">
          the perfect recipe
        </h2>
        <p className="text-foreground/80 max-w-md text-lg md:text-xl">
          Four simple steps to coordinate your next group event without the
          messy back-and-forth.
        </p>
      </div>

      {/* Orbit Row */}
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
