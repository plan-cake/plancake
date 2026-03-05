"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import MessagePage from "@/components/layout/message-page";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { formatApiError } from "@/lib/utils/api/handle-api-error";

const EMAIL_RESEND_COOLDOWN_MS = 30_000;

export default function Page() {
  const router = useRouter();
  const lastEmailResend = useRef<number | null>(null);
  const [email, setEmail] = useState("");
  const [cooldown, setCooldown] = useState(EMAIL_RESEND_COOLDOWN_MS / 1000);

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("register_email");
    if (!storedEmail) {
      // the user shouldn't be here
      router.push("/login");
    } else {
      setEmail(storedEmail);
      // don't clear the email from storage, it creates problems when testing
      // it should be deleted after the session ends anyway
    }
  }, [router]); // empty dependency array to run once on initial mount

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!email) {
    // don't render until there is an email
    return null;
  }

  const handleResendEmail = async () => {
    if (cooldown > 0) return false;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/resend-register-email/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email }),
        },
      );

      if (res.ok) {
        addToast("success", MESSAGES.SUCCESS_EMAIL_SENT);
        lastEmailResend.current = Date.now();
        setCooldown(EMAIL_RESEND_COOLDOWN_MS / 1000);
        return true;
      } else {
        addToast("error", formatApiError(await res.json()));
        return false;
      }
    } catch (err) {
      console.error("Fetch error:", err);
      addToast("error", MESSAGES.ERROR_GENERIC);
      return false;
    }
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <MessagePage
        title="Check your email"
        description={`A verification link was sent to ${email}.`}
        buttons={[
          <ActionButton
            key="0"
            buttonStyle="secondary"
            label={
              cooldown > 0 ? `Resend Email (${cooldown}s)` : "Resend Email"
            }
            onClick={handleResendEmail}
            disabled={cooldown > 0}
          />,
          <LinkButton
            key="1"
            buttonStyle="primary"
            label="Go to Login"
            href="/login"
          />,
        ]}
      />
    </div>
  );
}
