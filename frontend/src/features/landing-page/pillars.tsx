"use client";

import { Banner } from "@/features/system-feedback";
import { cn } from "@/lib/utils/classname";

import { Blend, Layers, Zap } from "lucide-react";

const PILLARS = [
  {
    title: "Stack Simple",
    description:
      "Every response layers into one clear view, so nobody scrolls through fifty messages to find a time.",
    icon: Layers,
  },
  {
    title: "Built for Groups",
    description:
      "From a two-person coffee chat to a twenty-person offsite, everyone's availability overlaps in real time.",
    icon: Blend,
  },
  {
    title: "Flip Fast",
    description: "No accounts. Share a link and watch the plan come together.",
    icon: Zap,
  },
];

export default function Pillars() {
  return (
    <section className="bg-background text-foreground py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="max-w-4xl text-center text-2xl font-bold leading-snug sm:text-4xl md:text-5xl">
            A better way to plan together
          </h2>

          <Banner type="info" className="mt-6 max-w-3xl text-sm sm:text-base">
            <span className="text-lg font-bold">Just trust the process.</span>
            <br />
            <span className="text-lg">
              Plancake takes some scheduling stress out of the chat and stacks
              it into one link everyone can check.
            </span>
          </Banner>
        </div>

        <div className="mt-6 grid gap-12 text-center sm:grid-cols-3 sm:gap-8">
          {PILLARS.map(({ title, description, icon: Icon }) => (
            <div key={title} className="flex flex-col items-center">
              <div
                className={cn(
                  "my-8 flex h-40 w-40 items-center justify-center",
                  "bg-lion text-background/90 ring-10 ring-bone rounded-full",
                )}
              >
                <Icon className="h-20 w-24" />
              </div>
              <h3 className="text-foreground text-lg font-semibold">{title}</h3>
              <p className="text-foreground/75 mt-2 max-w-xs text-base leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
