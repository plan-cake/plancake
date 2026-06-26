"use client";

import { useState } from "react";

import { MoveRightIcon } from "lucide-react";

import Step1 from "@/features/landing-page/components/step1";
import Step2 from "@/features/landing-page/components/step2";
import Step3 from "@/features/landing-page/components/step3";
import Step4 from "@/features/landing-page/components/step4";
import {
  PARTICIPANTS,
  TIMESLOTS,
  INITIAL_AVAILABILITIES,
} from "@/features/landing-page/utils";

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

  return (
    <div className="bg-panel flex flex-col gap-8 rounded-[4rem] p-8">
      <div className="text-center text-xl font-bold">
        Here&apos;s how it works:
      </div>
      <div className="hidden justify-between gap-8 md:flex">
        <div className="w-[45%]">
          <Step1 />
          <div className="h-[100px]" />
          <Step3
            timeslots={TIMESLOTS}
            userAvailability={userAvailability}
            allowSubmit={allowSubmit}
            onPaintSlot={paintSlot}
            onSubmit={handleAvailabilitySubmit}
          />
        </div>
        <div>
          <MoveRightIcon className="rotate-20 mt-12 h-10 w-10 opacity-25" />
          <MoveRightIcon className="rotate-160 mt-14 h-10 w-10 opacity-25" />
          <MoveRightIcon className="rotate-20 mt-16 h-10 w-10 opacity-25" />
        </div>
        <div className="w-[45%]">
          <div className="h-[75px]" />
          <Step2 />
          <div className="h-[100px]" />
          <Step4
            timeslots={TIMESLOTS}
            availabilities={availabilities}
            hoveredSlot={hoveredSlot}
            currentlyAvailable={currentlyAvailable}
            onHoverChange={handleResultsHover}
          />
        </div>
      </div>
      <div className="flex flex-col gap-8 md:hidden">
        <Step1 />
        <Step2 />
        <Step3
          timeslots={TIMESLOTS}
          userAvailability={userAvailability}
          allowSubmit={allowSubmit}
          onPaintSlot={paintSlot}
          onSubmit={handleAvailabilitySubmit}
        />
        <Step4
          timeslots={TIMESLOTS}
          availabilities={availabilities}
          hoveredSlot={hoveredSlot}
          currentlyAvailable={currentlyAvailable}
          onHoverChange={handleResultsHover}
        />
      </div>
    </div>
  );
}
