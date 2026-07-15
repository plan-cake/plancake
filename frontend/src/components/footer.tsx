import Logo from "@/components/logo";

export default function Footer() {
  const feedbackUrl = process.env.FEEDBACK_FORM_URL;

  return (
    <footer className="mt-12 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-foreground rounded-t-3xl p-8 md:p-10">
          <div className="flex flex-col items-center gap-6">
            {/* Logo */}
            <div>
              <Logo />
            </div>

            <div className="border-foreground flex w-full flex-col items-start gap-2 border-t pt-6 text-sm">
              {/* Feedback link */}
              <div>
                <a
                  href={feedbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer hover:underline"
                >
                  Feedback
                </a>
              </div>

              {/* Copyright text */}
              <p>
                © 2025 Plancake. Stacking up perfect plans, one pancake at a
                time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
