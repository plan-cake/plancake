import { PlusIcon } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/logo";
import LinkButton from "@/features/button/components/link";
import { cn } from "@/lib/utils/classname";

const NAV_SECTIONS = [
  {
    title: "Plancake",
    links: [
      { label: "New Event", href: "/new-event" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "What's New", href: "/version-history" },
      {
        label: "Feedback",
        href: "#",
        external: true,
      },
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
    <footer
      className={cn(
        "bg-lion ring-bone ring-100 relative mt-16",
        "[border-radius:50%_50%_0_0/100px_100px_0_0]",
        "md:[border-radius:50%_50%_0_0/150px_150px_0_0]",
        "lg:left-1/2 lg:aspect-[2/1] lg:w-[min(90vw,1440px)] lg:-translate-x-1/2 lg:rounded-none lg:rounded-t-full",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 pt-16 text-center sm:px-6 lg:absolute lg:inset-x-0 lg:top-[25%] lg:px-8 lg:pt-0">
        <h2 className="font-display text-violet relative mb-4 text-6xl tracking-wide lg:text-8xl">
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
        <div className="flex flex-col items-center gap-10 px-6 text-center md:flex-row md:items-start md:justify-evenly">
          <nav className="contents">
            {NAV_SECTIONS.map((section) => (
              <div key={section.title} className="flex flex-col items-center">
                <h3 className="mb-3 text-sm font-semibold tracking-wide opacity-60">
                  {section.title}
                </h3>
                <ul className="space-y-2 text-sm">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="hover:text-accent opacity-80 hover:font-semibold hover:opacity-100"
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="flex flex-col items-center">
            <span className="text-5xl font-black tracking-wide lg:text-5xl">
              108
            </span>
            <p className="mt-1 text-sm opacity-70">Plans made and counting</p>
          </div>
        </div>

        <div className="border-violet/15 mt-10 flex flex-col items-center gap-4 border-t pt-6 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
            <Logo />
          </div>

          <p className="text-sm opacity-70">
            &copy; {new Date().getFullYear()} Plancake. Stacking up perfect
            plans since 1900. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
