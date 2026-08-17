"use client";

import { useRef, useState } from "react";

import ActionButton from "@/features/button/components/action";
import ScheduleGrid from "@/features/event/grid/grid";
import ParticipantChip from "@/features/event/results/attendees/participant-chip";
import OrbitImages from "@/features/landing-page/orbit-images";
import {
  PARTICIPANTS,
  TIMESLOTS,
  INITIAL_AVAILABILITIES,
} from "@/features/landing-page/utils";
import { cn } from "@/lib/utils/classname";

// Reusable node component that handles the orbiting pill and its hover card
function OrbitNode({
  stepNumber,
  label,
  hoverCard,
}: {
  stepNumber: number;
  label: string;
  hoverCard: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [opensLeft, setOpensLeft] = useState(false);

  const handleMouseEnter = () => {
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

  return (
    <div
      ref={containerRef}
      className="group relative flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
    >
      <button
        className={cn(
          "bg-background hover:bg-lion dark:hover:bg-bone-100 hover:text-violet text-foreground",
          "flex items-center gap-2 whitespace-nowrap rounded-full p-4 font-semibold",
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
          "w-xl pointer-events-none absolute top-1/2 -translate-y-1/2 opacity-0 transition-all duration-300 ease-out hover:z-50 group-hover:pointer-events-auto group-hover:opacity-100",
          opensLeft
            ? "right-[110%] origin-right scale-95 group-hover:scale-100"
            : "left-[110%] origin-left scale-95 group-hover:scale-100",
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
      for (const slotIso of Object.keys(prev)) {
        if (userAvailability.has(slotIso)) {
          if (!prev[slotIso].includes(you)) prev[slotIso].push(you);
        } else {
          prev[slotIso] = prev[slotIso].filter((p) => p !== you);
        }
      }
      return { ...prev };
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
      <div className="mb-2 text-lg font-bold">Create your event</div>
      <div className="text-background/70 text-sm">
        Pick a range of dates and times you think might work.
      </div>
    </div>
  );

  const step2 = (
    <div key="step2" className="p-4 text-center">
      <div className="mb-2 text-lg font-bold">Share with your friends</div>
      <div className="text-background/70 text-sm">
        Anyone can join from the event link, no account required.
      </div>
    </div>
  );

  const step3 = (
    <div key="step3" className="p-4">
      <div className="mb-4 text-center">
        <div className="text-lg font-bold">Paint your availability</div>
        <div className="text-background/70 text-sm">
          Click and drag on the grid to fill in the times you&apos;re free.
        </div>
      </div>
      <div className="bg-background text-foreground rounded-2xl p-4">
        <ScheduleGrid
          mode="paint"
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
        <div className="text-lg font-bold">Watch the results stack up</div>
        <div className="text-background/70 text-sm">
          See which times work best for everyone as soon as they respond.
        </div>
      </div>
      <div className="bg-background text-foreground rounded-2xl p-4">
        <ScheduleGrid
          mode="view"
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

  const orbitNodes = [
    <OrbitNode key="1" stepNumber={1} label="Create Event" hoverCard={step1} />,
    <OrbitNode key="4" stepNumber={4} label="View Results" hoverCard={step4} />,
    <OrbitNode
      key="3"
      stepNumber={3}
      label="Add Availability"
      hoverCard={step3}
    />,
    <OrbitNode key="2" stepNumber={2} label="Share Link" hoverCard={step2} />,
  ];

  return (
    <div className="mb-50 my-20 flex flex-col items-end gap-12 overflow-visible md:flex-row">
      {/* Text Column */}
      <div className="w-full shrink-0 md:w-[25%]">
        <h2 className="text-4xl font-bold lg:text-5xl">The perfect recipe</h2>
        <p className="mt-6 max-w-md text-xl opacity-80">
          Four simple steps to stack up your next group event without the messy
          back-and-forth.
        </p>
      </div>

      {/* Orbit Column */}
      <div className="relative flex w-full flex-1 items-center justify-center">
        <div className="w-full min-w-[800px]">
          <OrbitImages
            images={orbitNodes}
            shape="ellipse"
            baseWidth={900}
            radiusX={350}
            radiusY={140}
            rotation={-20}
            duration={45}
            itemSize={160}
            responsive={true}
            direction="normal"
            fill
            showPath
            paused={true}
          />
        </div>
      </div>
    </div>
  );
}
