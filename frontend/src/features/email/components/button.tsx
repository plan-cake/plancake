import { Button } from "react-email";

import { cn } from "@/lib/utils/classname";

export function EmailButton({ href, label }: { href: string; label: string }) {
  return (
    <Button
      href={href}
      className={cn(
        "bg-accent inline-block rounded-full px-4 py-2",
        "text-background text-md text-center",
      )}
    >
      {label}
    </Button>
  );
}
