export interface DemoStepConfig {
  step: number;
  label: string;
  title: string;
  description: string;
  openAbove?: boolean;
}

export const DEMO_STEPS_CONFIG: DemoStepConfig[] = [
  {
    step: 1,
    label: "Create Event",
    title: "Create Your Event",
    description: "Pick a range of dates and times you think might work.",
  },
  {
    step: 2,
    label: "Share Link",
    title: "Share with Your Friends",
    description: "Anyone can join from the event link, no account required.",
  },
  {
    step: 3,
    label: "Add Availability",
    title: "Paint Your Availability",
    description:
      "Try it here! Click and drag on the grid to fill in the times you're free.",
    openAbove: true,
  },
  {
    step: 4,
    label: "View Results",
    title: "Watch the Results Stack Up",
    description:
      "See which times work best for everyone as soon as they respond.",
  },
];
