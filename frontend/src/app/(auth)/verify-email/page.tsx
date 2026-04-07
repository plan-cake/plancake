"use client";

import { useEffect, useState } from "react";

import { notFound, useSearchParams } from "next/navigation";

import MessagePage from "@/components/layout/message-page";
import LinkButton from "@/features/button/components/link";
import { useToast } from "@/features/system-feedback";
import { clientPost } from "@/lib/utils/api/client-fetch";
import { ROUTES } from "@/lib/utils/api/endpoints";
import { ApiErrorResponse } from "@/lib/utils/api/fetch-wrapper";

export default function Page() {
  const [verifying, setVerifying] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("code");
  if (!token) {
    notFound();
  }

  // TOASTS AND ERROR STATES
  const { addToast } = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setVerifying(false);
        setEmailVerified(false);
        return;
      }

      try {
        await clientPost(ROUTES.auth.verifyEmail, { verification_code: token });
        setEmailVerified(true);
      } catch (e) {
        const error = e as ApiErrorResponse;
        addToast("error", error.formattedMessage);
      }

      setVerifying(false);
    };

    verifyEmail();
  }, [token, addToast]);

  return (
    <div className="flex h-screen items-center justify-center">
      {verifying ? (
        <div className="text-center">
          <h2 className="mb-6">Verifying...</h2>
        </div>
      ) : emailVerified ? (
        <MessagePage
          title="Email Verified"
          description="Welcome to Plancake!"
          buttons={[
            <LinkButton
              key="0"
              buttonStyle="primary"
              label="Go to Login"
              href="/login"
            />,
          ]}
        />
      ) : (
        <MessagePage
          title="Failed to Verify Email"
          description="This link is invalid or has expired."
          buttons={[
            <LinkButton
              key="0"
              buttonStyle="primary"
              label="Back to Register"
              href="/register"
            />,
          ]}
        />
      )}
    </div>
  );
}
