import { LoaderCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils/classname";

export default function LoadingSpinner({ className }: { className?: string }) {
  return (
    <LoaderCircleIcon
      className={cn("animate-spin rounded-full text-white", className)}
    />
  );
}
