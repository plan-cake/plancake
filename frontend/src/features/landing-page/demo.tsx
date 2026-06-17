"use client";

import { useState } from "react";

import { MoveRightIcon } from "lucide-react";

import ActionButton from "@/features/button/components/action";
import ScheduleGrid from "@/features/event/grid/grid";
import ParticipantChip from "@/features/event/results/attendees/participant-chip";

const PARTICIPANTS = ["Mickey", "Goofy", "Donald", "You"];

const generateTimeslots = () => {
  const slots = [];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 12; j++) {
      const date = new Date(2025, 9, 19 + i, 8);
      // advance by 15 minutes each
      date.setMinutes(date.getMinutes() + j * 15);
      slots.push(date);
    }
  }
  return slots;
};

const generateAvailabilities = (timeslots: Date[]) => {
  const availabilities: Record<string, string[]> = {};
  for (let i = 0; i < timeslots.length; i++) {
    const slotIso = timeslots[i].toISOString();
    const available = [];
    if ((i >= 4 && i < 22) || (i >= 28 && i < 34))
      available.push(PARTICIPANTS[0]);
    if ((i >= 0 && i < 20) || (i >= 30 && i < 36))
      available.push(PARTICIPANTS[1]);
    if ((i >= 3 && i < 12) || (i >= 15 && i < 23) || (i >= 26 && i < 34))
      available.push(PARTICIPANTS[2]);
    availabilities[slotIso] = available;
  }
  return availabilities;
};

const TIMESLOTS = generateTimeslots();
const INITIAL_AVAILABILITIES = generateAvailabilities(TIMESLOTS);

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
    <div className="bg-background rounded-4xl mx-auto w-fit px-4 py-2 text-center">
      <div className="text-lg font-bold">1. Create your event</div>
      <div className="text-sm opacity-75">
        Pick a range of dates and times you think might work.
      </div>
    </div>
  );

  const step2 = (
    <div className="bg-background rounded-4xl mx-auto w-fit px-4 py-2 text-center">
      <div className="text-lg font-bold">2. Share with your friends</div>
      <div className="text-sm opacity-75">
        Anyone can join from the event link, no account required.
      </div>
    </div>
  );

  const step3 = (
    <div className="bg-background rounded-4xl h-fit p-4">
      <div className="text-center">
        <div className="text-lg font-bold">3. Paint your availability</div>
        <div className="text-sm opacity-75">
          Click and drag on the grid to fill in the times you&apos;re free.
        </div>
      </div>
      <ScheduleGrid
        mode="paint"
        staticHeader
        timeslots={TIMESLOTS}
        timezone="America/New_York"
        userAvailability={userAvailability}
        onToggleSlot={paintSlot}
      />
      <div className="-mt-2 flex items-center justify-center gap-2">
        <ActionButton
          buttonStyle="primary"
          label="Submit"
          onClick={handleAvailabilitySubmit}
          disabled={!allowSubmit}
        />
      </div>
    </div>
  );

  const step4 = (
    <div className="bg-background rounded-4xl w-full p-4">
      <div className="text-center">
        <div className="text-lg font-bold">4. Watch the results stack up</div>
        <div className="text-sm opacity-75">
          See which times work best for everyone as soon as they respond.
        </div>
      </div>
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
      <div className="pointer-events-none -mt-2 flex flex-wrap items-center justify-center gap-2 px-2">
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
  );

  return (
    <div className="bg-panel flex flex-col gap-8 rounded-[4rem] p-8">
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
