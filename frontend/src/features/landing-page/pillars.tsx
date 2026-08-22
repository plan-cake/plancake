"use client";

import { Blend, Layers, Zap } from "lucide-react";

import { Banner } from "@/features/system-feedback";
import { cn } from "@/lib/utils/classname";

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
    <section className="bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <h2 className="font-display text-foreground text-center text-5xl tracking-wide md:text-6xl">
            a better way to plan together
          </h2>

          <Banner type="info" className="mt-8 max-w-3xl text-sm sm:text-base">
            <span className="text-lg font-bold">Just trust the process.</span>
            <br />
            <span className="text-lg">
              Plancake takes some scheduling stress out of the chat and stacks
              it into one link everyone can check.
            </span>
          </Banner>
        </div>

        <div className="mt-12 grid gap-12 text-center sm:grid-cols-3 sm:gap-8">
          {PILLARS.map(({ title, description, icon: Icon }) => (
            <div key={title} className="flex flex-col items-center">
              <div
                className={cn(
                  "my-8 flex h-40 w-40 items-center justify-center",
                  "bg-lion text-background/90 ring-bone ring-10 rounded-full",
                )}
              >
                <Icon className="h-20 w-24" />
              </div>
              <h3 className="text-foreground text-xl font-bold tracking-tight">
                {title}
              </h3>
              <p className="text-foreground/75 mt-3 max-w-xs text-base leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
