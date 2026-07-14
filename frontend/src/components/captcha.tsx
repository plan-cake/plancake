"use client";

import { useEffect, useRef, useState } from "react";

import type { TurnstileInstance } from "@marsidev/react-turnstile";
import { Turnstile } from "@marsidev/react-turnstile";

import { FloatingDrawer } from "@/features/drawer";
import { Banner } from "@/features/system-feedback/banner/base";
import BaseDialog from "@/features/system-feedback/dialog/components/base";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

interface CaptchaProps {
  onTokenChange: (token: string | null) => void;
  backendVerificationFailed: boolean;
  onClearBackendError: () => void;
  // Permanently show the error banner, for testing purposes
  debugShowBanner?: boolean;
}

export default function Captcha({
  onTokenChange,
  backendVerificationFailed,
  onClearBackendError,
  debugShowBanner = false,
}: CaptchaProps) {
  // DIALOG TYPE
  const isMobile = useCheckMobile();
  const Dialog = isMobile ? FloatingDrawer : BaseDialog;

  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const [initError, setInitError] = useState(false);
  const [recoveryDialogOpen, setRecoveryDialogOpen] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!;

  // Watch for verification failures from the backend
  useEffect(() => {
    if (backendVerificationFailed) {
      setRecoveryDialogOpen(true);
      // Reset the widget to retry in the dialog
      turnstileRef.current?.reset();
    }
  }, [backendVerificationFailed]);

  const handleSuccess = (token: string) => {
    setInitError(false);
    onTokenChange(token);

    if (recoveryDialogOpen) {
      // If this was in the dialog, clear the backend error
      setRecoveryDialogOpen(false);
      onClearBackendError();
    }
  };

  const handleExpire = () => {
    onTokenChange(null);
    turnstileRef.current?.reset();
  };

  const handleError = () => {
    setInitError(true);
    onTokenChange(null);
  };

  const handleCloseDialog = () => {
    setRecoveryDialogOpen(false);
    onClearBackendError();
  };

  // Render banner if the CAPTCHA failed to initialize
  if (initError || debugShowBanner) {
    return (
      <Banner type="error" title="CAPTCHA Blocked" className="text-left">
        Please disable strict ad blockers or try a different browser to
        continue.
      </Banner>
    );
  }

  // Otherwise, use the invisible widget and only show the dialog on failure
  return (
    <>
      {!recoveryDialogOpen && (
        <div className="hidden">
          <Turnstile
            ref={turnstileRef}
            siteKey={siteKey}
            onSuccess={handleSuccess}
            onExpire={handleExpire}
            onError={handleError}
            options={{ size: "invisible", theme: "auto" }}
          />
        </div>
      )}
      <Dialog
        title="Additional Verification Required"
        description="CAPTCHA failed. Please complete the challenge below and try again."
        open={recoveryDialogOpen}
        onOpenChange={handleCloseDialog}
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-muted-foreground text-sm">
            CAPTCHA failed. Please complete the challenge below and try again.
          </p>

          <Turnstile
            ref={turnstileRef}
            siteKey={siteKey}
            onSuccess={handleSuccess}
            onExpire={handleExpire}
            onError={handleError}
            options={{ size: "normal", theme: "auto" }}
          />
        </div>
      </Dialog>
    </>
  );
}
