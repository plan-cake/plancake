import { TriangleAlertIcon } from "lucide-react";

import { cn } from "@/lib/utils/classname";

export default function GridMessage({
  error,
  message,
}: {
  error: boolean;
  message: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center gap-2 text-center text-sm",
        !error && "opacity-75",
      )}
    >
      {error && <TriangleAlertIcon className="text-error h-5 w-5" />}
      {message}
    </div>
  );
}
