import { PlusIcon } from "lucide-react";

// import Logo from "@/components/logo";
import LinkButton from "@/features/button/components/link";
import Demo from "@/features/landing-page/demo";
import Footer from "@/features/landing-page/footer";
import Hero from "@/features/landing-page/hero";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />

      <section>
        <div className="mx-auto mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Demo />
        </div>
      </section>

      {/* Why Plancake Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="bg-bone rounded-3xl p-8 md:p-12 dark:bg-gray-300">
            <h2 className="bubble-text text-violet text-center text-4xl md:text-6xl">
              why
              <br />
              plancake?
            </h2>
            <div className="mt-12 grid gap-10 text-center md:grid-cols-3 md:text-left">
              <div>
                <div className="bg-accent text-accent-text mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold md:mx-0">
                  1
                </div>
                <h3 className="text-violet mb-2 text-xl font-semibold">
                  Smart Planning
                </h3>
                <p className="text-violet/80">
                  Intelligently suggest optimal meeting times based on
                  everyone&apos;s availability.
                </p>
              </div>
              <div>
                <div className="bg-accent text-accent-text mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold md:mx-0">
                  2
                </div>
                <h3 className="text-violet mb-2 text-xl font-semibold">
                  Easy Coordination
                </h3>
                <p className="text-violet/80">
                  Share a simple link and watch as responses stack up without
                  the back-and-forth.
                </p>
              </div>
              <div>
                <div className="bg-accent text-accent-text mx-auto mb-4 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold md:mx-0">
                  3
                </div>
                <h3 className="text-violet mb-2 text-xl font-semibold">
                  Perfect Results
                </h3>
                <p className="text-violet/80">
                  Get the ideal meeting time that works for everyone with an
                  intuitive graph view.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Golden Stack Recipe */}
      {/* <section className="py-16">
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

          <div className="bg-bone text-violet rounded-3xl p-8 md:p-12 dark:bg-gray-300">
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
      </section> */}

      {/* Plan Today Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* <div className="bg-violet relative overflow-hidden rounded-3xl px-8 py-20 text-center"> */}
          <h2 className="bubble-text text-lion relative mb-8 text-6xl md:text-8xl">
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
          {/* </div> */}
          {/* 
          <div className="mt-12 text-center">
            <div className="mb-2 flex justify-center">
              <Logo />
            </div>
            <p className="text-sm opacity-70">
              © 2025 Plancake. Stacking up perfect plans, one pancake at a
              time.
            </p>
          </div> */}
        </div>
      </section>

      <Footer />
    </main>
  );
}
