import Demo from "@/features/landing-page/demo";
import Footer from "@/features/landing-page/footer";
import Hero from "@/features/landing-page/hero";
import Pillars from "@/features/landing-page/pillars";

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
