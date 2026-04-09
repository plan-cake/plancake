import { PlusIcon, LayoutDashboardIcon } from "lucide-react";

import Logo from "@/components/logo";
import LinkButton from "@/features/button/components/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <h1 className="mb-12">
            <span className="block text-5xl font-light md:text-7xl">
              planning made
            </span>
            <span className="font-display text-lion mt-4 block text-center text-6xl leading-none md:text-8xl">
              stack
              <br />
              simple
            </span>
          </h1>
          <h2 className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed">
            The fluffiest way to coordinate schedules and plan group events.
            Stack up availability and serve the perfect meeting time.
          </h2>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <LinkButton
              buttonStyle="primary"
              icon={<PlusIcon />}
              label="Mix Your First Plan"
              href="/new-event"
            />
            <LinkButton
              buttonStyle="secondary"
              icon={<LayoutDashboardIcon />}
              label="View Dashboard"
              href="/dashboard"
            />
          </div>
        </div>
      </section>

      {/* Why Plancake Section */}
      <section>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-bone rounded-3xl p-8 dark:bg-gray-300">
            <div className="grid items-center gap-12 md:grid-cols-2">
              {/* Pancake emoji - centered on mobile */}
              <div className="order-1 flex justify-center md:order-1">
                <div className="text-8xl">🥞</div>
              </div>

              {/* Content - centered on mobile, left-aligned on desktop */}
              <div className="order-2 text-center md:order-2 md:text-left">
                <h2 className="bubble-text text-violet mb-8 text-4xl md:text-6xl">
                  why
                  <br />
                  <span className="text-violet">plancake?</span>
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-violet mb-2 text-xl font-semibold">
                      Smart Planning
                    </h3>
                    <p className="text-violet">
                      Intelligently suggest optimal meeting times based on
                      everyone&apos;s availability.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-violet mb-2 text-xl font-semibold">
                      Easy Coordination
                    </h3>
                    <p className="text-violet">
                      Share a simple link and watch as responses stack up
                      without the back-and-forth.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-violet mb-2 text-xl font-semibold">
                      Perfect Results
                    </h3>
                    <p className="text-violet">
                      Get the ideal meeting time that works for everyone with an
                      intuitive graph view.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Stack Recipe */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="bubble-text text-4xl md:text-6xl">
              golden
              <br />
              <span className="text-lion">stack recipe</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg">
              Follow these simple steps to cook up the perfect schedule every
              time.
            </p>
          </div>

          <div className="bg-bone text-violet rounded-3xl p-8 dark:bg-gray-300">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="bg-lion mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                  <span className="text-3xl">🍳</span>
                </div>
                <h3 className="mb-4 text-xl font-semibold">Mix your event</h3>
                <p className="text-sm">
                  Set up your meeting details, add time options, and customize
                  your preferences
                </p>
              </div>
              <div className="text-center">
                <div className="bg-violet mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                  <span className="text-3xl">📤</span>
                </div>
                <h3 className="mb-4 text-xl font-semibold">Share & Stack</h3>
                <p className="text-sm">
                  Send the link to participants and watch responses stack up in
                  a flash
                </p>
              </div>
              <div className="text-center">
                <div className="bg-lion mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full">
                  <span className="text-3xl">🥞</span>
                </div>
                <h3 className="mb-4 text-xl font-semibold">Flip & Serve</h3>
                <p className="text-sm">
                  Review the results and serve up the ideal meeting time for
                  everyone
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Today Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="bubble-text text-lion mb-8 text-6xl md:text-8xl">
            PLAN TODAY
          </h2>
          <div className="mt-8 flex justify-center">
            <LinkButton
              buttonStyle="primary"
              icon={<PlusIcon />}
              label="Start Planning"
              href="/new-event"
            />
          </div>
          <div className="mt-12">
            <div className="mb-2">
              <Logo />
            </div>
            <p className="text-sm">
              © 2025 Plancake. Stacking up perfect plans, one pancake at a
              time.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
