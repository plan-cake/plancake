"use client";

import { useEffect, useRef } from "react";

import { useRouter } from "next/navigation";

import Loading from "@/app/loading";
import { useAccount } from "@/features/account/context";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loginState } = useAccount();
  const router = useRouter();
  const { addToast } = useToast();
  const hasBeenLoggedOutRef = useRef(false);

  useEffect(() => {
    if (loginState === "logged_out") {
      hasBeenLoggedOutRef.current = true;
    }

    if (loginState === "logged_in") {
      // Check if the user was logged out to avoid this triggering on login
      if (!hasBeenLoggedOutRef.current) {
        router.replace("/dashboard");
        addToast("info", MESSAGES.INFO_ALREADY_LOGGED_IN);
      }
    }
  }, [loginState, router, addToast]);

  if (loginState === "logged_in") {
    // Logged in status is included to avoid flickering on redirect
    return <Loading />;
  }

  return <>{children}</>;
}
