import { PlusIcon } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/logo";
import LinkButton from "@/features/button/components/link";

const NAV_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Start Planning", href: "/new-event" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "What's New", href: "/version-history" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log In", href: "/login" },
      { label: "Sign Up", href: "/register" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-lion ring-bone ring-100 relative rounded-t-full lg:left-1/2 lg:aspect-[2/1] lg:w-[min(90vw,1440px)] lg:-translate-x-1/2">
      <div className="mx-auto max-w-7xl px-4 pt-16 text-center sm:px-6 lg:absolute lg:inset-x-0 lg:top-[25%] lg:px-8 lg:pt-0">
        <h2 className="bubble-text text-violet relative mb-8 text-6xl lg:text-8xl">
          PLAN TODAY
        </h2>
        <div className="relative flex justify-center">
          <LinkButton
            buttonStyle="primary"
            icon={<PlusIcon />}
            label="Start Planning"
            href="/new-event"
          />
        </div>
      </div>

      <div className="text-violet mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:absolute lg:inset-x-0 lg:bottom-0 lg:px-8 lg:pt-0">
        <div className="flex flex-col items-center gap-10 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-3 md:items-start">
            <Logo />
            <p className="max-w-xs text-sm opacity-70">
              The easiest way to coordinate schedules and plan group events.
            </p>
          </div>

          <nav className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title}>
                <h3 className="mb-3 text-sm font-semibold tracking-wide opacity-60">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="opacity-80 hover:opacity-100"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-6 text-center text-sm opacity-70">
          &copy; {new Date().getFullYear()} Plancake. Stacking up perfect plans,
          one pancake at a time.
        </div>
      </div>
    </footer>
  );
}
