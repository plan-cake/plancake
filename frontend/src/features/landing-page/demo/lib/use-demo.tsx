"use client";

import { useState } from "react";

import {
  PARTICIPANTS,
  INITIAL_AVAILABILITIES,
} from "@/features/landing-page/demo/lib/utils";
import PaintAvailabilityStep from "@/features/landing-page/demo/paint-step";
import ViewResultsStep from "@/features/landing-page/demo/results-step";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export function useDemo() {
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
  const isMobile = useCheckMobile();

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

    if (isMobile) {
      setActiveStep(4);
    }
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

  return {
    activeStep,
    setActiveStep,
    getStepBody,
  };
}
