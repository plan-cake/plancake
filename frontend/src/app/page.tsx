import { Hero, Pillars, Demo, Footer } from "@/features/landing-page";

export default function Home() {
  return (
    <main className="min-h-screen w-full">
      <Hero />
      <div className="pb-100 flex flex-col gap-24 pt-24 md:gap-32 md:py-32">
        <Pillars />
        <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <Demo />
        </section>
      </div>
      <Footer />
    </main>
  );
}
