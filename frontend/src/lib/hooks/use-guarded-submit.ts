import { useRef, useState } from "react";

export function useGuardedSubmit(onSubmit: () => unknown | Promise<unknown>) {
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      return await onSubmit();
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return { submitting, handleSubmit };
}
