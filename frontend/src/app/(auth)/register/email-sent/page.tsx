"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import MessagePage from "@/components/layout/message-page";
import ActionButton from "@/features/button/components/action";
import LinkButton from "@/features/button/components/link";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function Page() {
  const router = useRouter();
  const lastEmailResend = useRef(Date.now());
  const [email, setEmail] = useState("");

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

  if (!email) {
    // don't render until there is an email
    return null;
  }

  const handleResendEmail = async () => {
    const emailResendCooldown = 30000; // 30 seconds
    let timeLeft =
      (emailResendCooldown - (Date.now() - lastEmailResend.current)) / 1000;
    timeLeft = Math.ceil(timeLeft);
    if (timeLeft > 0) {
      addToast(
        "info",
        `Slow down! ${timeLeft} seconds until you can send again.`,
      );
      return false;
    }

    try {
      await clientPost(ROUTES.auth.resendRegisterEmail, { email });
      addToast("success", MESSAGES.SUCCESS_EMAIL_SENT);
      lastEmailResend.current = Date.now();
      return true;
    } catch (e) {
      const error = e as ApiErrorResponse;
      addToast("error", error.formattedMessage);
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
            label="Resend Email"
            onClick={handleResendEmail}
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
