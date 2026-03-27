"use client";

import { useEffect, useRef } from "react";

import { usePathname, useRouter } from "next/navigation";

import Loading from "@/app/loading";
import { useAccount } from "@/features/account/context";
import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";

const ALLOWED_AUTH_ROUTES = ["/reset-password"];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loginState } = useAccount();
  const router = useRouter();
  const pathname = usePathname();
  const { addToast } = useToast();
  const hasBeenLoggedOutRef = useRef(false);

  const isAllowedRoute = ALLOWED_AUTH_ROUTES.includes(pathname);

  useEffect(() => {
    if (loginState === "logged_out") {
      hasBeenLoggedOutRef.current = true;
    }

    if (loginState === "logged_in") {
      if (isAllowedRoute) return;

      // Check if the user was logged out to avoid this triggering on login
      if (!hasBeenLoggedOutRef.current) {
        router.replace("/dashboard");
        addToast("info", MESSAGES.INFO_ALREADY_LOGGED_IN);
      }
    }
  }, [loginState, router, addToast, isAllowedRoute]);

  if (loginState === "logged_in" && !isAllowedRoute) {
    // Logged in status is included to avoid flickering on redirect
    return <Loading />;
  }

  return <>{children}</>;
}
