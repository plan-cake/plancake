import { ButtonArray } from "@/features/button/button-array";
import { cn } from "@/lib/utils/classname";

export default function MobileFooterIsland({
  children,
  leftButtons,
  rightButtons,
}: {
  children?: React.ReactNode;
  leftButtons?: ButtonArray;
  rightButtons?: ButtonArray;
}) {
  return (
    <div
      className={cn(
        "fixed bottom-2 left-0 right-0 mx-auto md:hidden",
        "w-full max-w-[calc(100%-1rem)]",
        "bg-panel rounded-4xl p-3",
        "border-foreground/10 border",
        "flex flex-col gap-3",
      )}
    >
      {children}
      <div className="flex w-full justify-between gap-2">
        {leftButtons ? (
          leftButtons.map((button, index) => <div key={index}>{button}</div>)
        ) : (
          // Placeholder to keep right buttons aligned
          <div />
        )}
        {rightButtons &&
          rightButtons.map((button, index) => <div key={index}>{button}</div>)}
      </div>
    </div>
  );
}
