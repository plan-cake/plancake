import Demo from "@/features/landing-page/demo";
import Footer from "@/features/landing-page/footer";
import Hero from "@/features/landing-page/hero";
import Pillars from "@/features/landing-page/pillars";
import WhyBento from "@/features/landing-page/why-bento";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />

      <Pillars />

      {/* Why Plancake Section */}
      {/* <section className="py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 text-center">
            <h2 className="bubble-text text-violet text-4xl md:text-6xl">
              Built to serve
            </h2>
            <p className="text-violet/70 mx-auto mt-4 max-w-xl text-lg">
              Four reasons your group chat will thank you.
            </p>
          </div>

          <WhyBento />
        </div>
      </section> */}

      <section>
        <div className="mx-auto mb-12 mt-80 max-w-7xl px-4 sm:px-6 lg:px-8">
          <Demo />
        </div>
      </section>

      <Footer />
    </main>
  );
}
