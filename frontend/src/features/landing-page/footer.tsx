import { Github } from "@thesvg/react";
import { PlusIcon, MailIcon } from "lucide-react";
import Link from "next/link";

import Logo from "@/components/logo";
import LinkButton from "@/features/button/components/link";
import { cn } from "@/lib/utils/classname";

const NAV_SECTIONS = [
  {
    title: "The Stack",
    links: [
      { label: "New Event", href: "/new-event" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Change Log", href: "/version-history" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Log In", href: "/login" },
      { label: "Sign Up", href: "/register" },
      { label: "Settings", href: "/settings" },
    ],
  },
  {
    title: "Resources",
    links: [
      ...(process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL
        ? [
            {
              label: "Feedback",
              href: process.env.NEXT_PUBLIC_FEEDBACK_FORM_URL,
              external: true,
            },
          ]
        : []),
      {
        label: "Report a Bug",
        href: "https://github.com/plan-cake/plancake/issues",
        external: true,
      },
      { label: "Contact Us", href: "mailto:plancakeapp.support@gmail.com" },
    ],
  },
];

const LEGAL_LINKS = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
];

export default function Footer() {
  return (
    <footer
      className={cn(
        "bg-lion ring-bone ring-100 relative mt-16",
        "[border-radius:50%_50%_0_0/100px_100px_0_0]",
        "md:left-1/2 md:aspect-[2/1] md:w-[clamp(1300px,90vw,1440px)] md:-translate-x-1/2 md:rounded-none md:rounded-t-full",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 pt-16 text-center sm:px-6 md:absolute md:inset-x-0 md:top-[25%] md:max-w-[min(100vw,80rem)] md:pt-0 lg:px-8">
        <h2 className="font-display text-violet relative mb-4 text-6xl tracking-wide md:text-8xl">
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
      <div className="text-violet mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 md:absolute md:inset-x-0 md:bottom-0 md:max-w-[min(100vw,80rem)] md:pt-0 lg:px-8">
        <div className="flex flex-col items-center gap-10 px-6 text-center md:flex-row md:items-start md:justify-center md:gap-24 md:text-left">
          <nav className="contents">
            {NAV_SECTIONS.map((section) => (
              <div
                key={section.title}
                className="flex flex-col items-center md:items-start"
              >
                <h3 className="text-accent mb-3 text-sm font-semibold tracking-wide opacity-60">
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
        </div>

        <div className="border-violet/15 mt-10 flex flex-col items-center gap-4 border-t pt-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
          <div className="flex flex-col items-center gap-3 md:flex-row md:items-center">
            <Logo />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col-reverse items-center gap-4 md:flex-row md:justify-end">
              <div className="flex items-center gap-4">
                {LEGAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-accent text-sm opacity-80 hover:font-semibold hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/plan-cake"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Plancake GitHub Organization"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="mailto:plancakeapp.support@gmail.com"
                  aria-label="Email Plancake Support"
                >
                  <MailIcon className="h-4 w-4" />
                </a>
              </div>
            </div>

            <p className="text-sm opacity-70">
              &copy; {new Date().getFullYear()} Plancake. Stacking up perfect
              plans since 1900. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
