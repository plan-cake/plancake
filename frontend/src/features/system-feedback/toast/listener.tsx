"use client";

import { useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { useToast } from "@/features/system-feedback";
import { MESSAGES } from "@/lib/messages";

export default function ToastListener() {
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  /**
   * This effect listens for specific query parameters that we set in the middleware
   * when redirecting users:
   *
   * - "unauthorized": set when a user tries to access a protected page without
   *    being logged in
   * - "alreadyLoggedIn": set when a user tries to access the login page while they
   *    are already logged in
   *
   * If it sees either of those, it fires the appropriate toast and then removes the
   * query parameter from the URL to prevent duplicate toasts on page refresh.
   */
  useEffect(() => {
    const isUnauthorized = searchParams.get("unauthorized") === "true";
    const isAlreadyLoggedIn = searchParams.get("alreadyLoggedIn") === "true";
    if (!isUnauthorized && !isAlreadyLoggedIn) return;

    const message = isUnauthorized
      ? MESSAGES.INFO_NOT_LOGGED_IN
      : MESSAGES.INFO_ALREADY_LOGGED_IN;
    addToast("info", message);

    // Clean up URL
    const paramToRemove = isUnauthorized ? "unauthorized" : "alreadyLoggedIn";
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete(paramToRemove);
    window.history.replaceState({}, "", newUrl.toString());
  }, [searchParams, addToast]);

  return null;
}
