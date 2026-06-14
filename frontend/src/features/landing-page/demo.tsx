"use client";

import { useState } from "react";

import { MoveRightIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
import ScheduleGrid from "@/features/event/grid/grid";
import ParticipantChip from "@/features/event/results/attendees/participant-chip";

export default function Demo() {
  const timeslots = [];

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 12; j++) {
      const date = new Date(2025, 9, 19 + i, 8);
      // advance by 15 minutes each
      date.setMinutes(date.getMinutes() + j * 15);
      timeslots.push(date);
    }
  }

  const [userAvailability, setUserAvailability] = useState<Set<string>>(
    new Set(),
  );

  const participants = ["Mickey", "Goofy", "Donald", "You"];
  const [currentlyAvailable, setCurrentlyAvailable] = useState<string[]>([
    "Mickey",
    "Goofy",
    "Donald",
    "You",
  ]);

  const newAvailabilities: Record<string, string[]> = {};
  for (let i = 0; i < timeslots.length; i++) {
    const slotIso = timeslots[i].toISOString();
    const available = [];
    if ((i >= 4 && i < 22) || (i >= 28 && i < 34)) available.push("Mickey");
    if ((i >= 0 && i < 20) || (i >= 30 && i < 36)) available.push("Goofy");
    if ((i >= 3 && i < 12) || (i >= 15 && i < 23) || (i >= 26 && i < 34))
      available.push("Donald");
    newAvailabilities[slotIso] = available;
  }

  const [availabilities, setAvailabilities] =
    useState<Record<string, string[]>>(newAvailabilities);

  const handleAvailabilitySubmit = () => {
    setAvailabilities((prev) => {
      for (const slotIso of Object.keys(prev)) {
        if (userAvailability.has(slotIso)) {
          if (!prev[slotIso].includes("You"))
            prev[slotIso] = [...prev[slotIso], "You"];
        } else {
          prev[slotIso] = prev[slotIso].filter((p) => p !== "You");
        }
      }
      return { ...prev };
    });
  };

  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const handleSlotHover = (slotIso: string | null) => {
    setHoveredSlot(slotIso);
    if (slotIso) {
      setCurrentlyAvailable(availabilities[slotIso]);
    } else {
      setCurrentlyAvailable(participants);
    }
  };

  const toggleSlot = (slotIso: string, togglingOn: boolean) => {
    setUserAvailability((prev) => {
      const newSet = new Set(prev);
      if (togglingOn) {
        newSet.add(slotIso);
      } else {
        newSet.delete(slotIso);
      }
      return newSet;
    });
  };

  const step1 = (
    <div className="bg-background mx-auto w-fit rounded-full px-4 py-2 text-center">
      <div className="text-lg font-bold">1. Create your event</div>
      <div className="text-sm opacity-75">
        Pick a range of dates and times you think might work.
      </div>
    </div>
  );

  const step2 = (
    <div className="bg-background mx-auto w-fit rounded-full px-4 py-2 text-center">
      <div className="text-lg font-bold">2. Share with your friends</div>
      <div className="text-sm opacity-75">
        Anyone can join from the event link, no account required.
      </div>
    </div>
  );

  const step3 = (
    <div className="bg-background h-fit rounded-3xl p-4">
      <div className="text-center">
        <div className="text-lg font-bold">3. Paint your availability</div>
        <div className="text-sm opacity-75">
          Click and drag on the grid to fill in the times you&apos;re free.
        </div>
      </div>
      <ScheduleGrid
        mode="paint"
        staticHeader
        timeslots={timeslots}
        timezone="America/New_York"
        userAvailability={userAvailability}
        onToggleSlot={toggleSlot}
      />
      <div className="-mt-2 flex items-center justify-center gap-2">
        <ActionButton
          buttonStyle="primary"
          label="Submit"
          onClick={handleAvailabilitySubmit}
        />
      </div>
    </div>
  );

  const step4 = (
    <div className="bg-background w-full rounded-3xl p-4">
      <div className="text-center">
        <div className="text-lg font-bold">4. Watch the results stack up</div>
        <div className="text-sm opacity-75">
          See which times work best for everyone as soon as they respond.
        </div>
      </div>
      <ScheduleGrid
        mode="view"
        staticHeader
        timeslots={timeslots}
        timezone="America/New_York"
        availabilities={availabilities}
        numParticipants={4}
        hoveredSlot={hoveredSlot}
        setHoveredSlot={handleSlotHover}
      />
      <div className="pointer-events-none -mt-2 flex flex-wrap items-center justify-center gap-2 px-2">
        {participants.map((p) => (
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
  );

  return (
    <div className="rounded-4xl bg-panel flex flex-col gap-8 p-8">
      <div className="text-center text-xl font-bold">
        Here&apos;s how it works:
      </div>
      <div className="hidden justify-between gap-8 md:flex">
        <div className="w-[45%]">
          {step1}
          <div className="h-[100px]" />
          {step3}
        </div>
        <div>
          <MoveRightIcon className="rotate-20 mt-12 h-10 w-10 opacity-25" />
          <MoveRightIcon className="rotate-160 mt-14 h-10 w-10 opacity-25" />
          <MoveRightIcon className="rotate-20 mt-16 h-10 w-10 opacity-25" />
        </div>
        <div className="w-[45%]">
          <div className="h-[75px]" />
          {step2}
          <div className="h-[100px]" />
          {step4}
        </div>
      </div>
      <div className="flex flex-col gap-8 md:hidden">
        {step1}
        {step2}
        {step3}
        {step4}
      </div>
    </div>
  );
}
