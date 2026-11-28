import { useState, useMemo, useCallback } from "react";

import { useToast } from "@/features/system-feedback/toast/context";
import { MESSAGES } from "@/lib/messages";

export function useFormErrors() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();

  const clearAllErrors = useCallback(() => setErrors({}), []);

  const handleError = useCallback(
    (field: string, message: string) => {
      // clear error if message is empty
      if (!message) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return;
      }

      // show toast for api and toast errors
      if (field === "api" || field === "toast" || field === "captcha") {
        addToast("error", message);
      } else if (field === "rate_limit" && !message) {
        message = MESSAGES.ERROR_RATE_LIMIT;
      }

      setErrors((prev) => ({
        ...prev,
        [field]: message,
      }));
    },
    [addToast],
  );

  const handleGenericError = useCallback(() => {
    addToast("error", MESSAGES.ERROR_GENERIC);
  }, [addToast]);

  const batchHandleErrors = useCallback(
    (newErrors: Record<string, string>) => {
      setErrors((prev) => ({ ...prev, ...newErrors }));
      for (const message of Object.values(newErrors)) {
        addToast("error", message);
      }
    },
    [addToast],
  );

  return useMemo(
    () => ({
      errors,
      handleError,
      clearAllErrors,
      handleGenericError,
      batchHandleErrors,
    }),
    [
      errors,
      handleError,
      clearAllErrors,
      handleGenericError,
      batchHandleErrors,
    ],
  );
}
