"use client";

import { createContext, useContext } from "react";

import { ToastOptions } from "@/features/system-feedback/toast/type";
import { ToastType } from "@/features/system-feedback/type";

type ToastContextValue = {
  addToast: (
    type: ToastType,
    message: string,
    options?: ToastOptions,
  ) => number;
  removeToast: (id: number) => void;
};

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export default ToastContext;
