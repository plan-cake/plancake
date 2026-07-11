import Logo from "@/components/logo";

export default function Footer() {
  const feedbackUrl = process.env.FEEDBACK_FORM_URL;

  return (
    <footer className="bg-panel text-foreground mt-12 w-full">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-10">
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
              className="hover:underline"
            >
              Feedback
            </a>
          </div>

          {/* Copyright text */}
          <p className="text-sm">
            © 2025 Plancake. Stacking up perfect plans, one pancake at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
