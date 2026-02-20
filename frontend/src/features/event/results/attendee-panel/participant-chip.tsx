import { TrashIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils/classname";

export default function ParticipantChip({
  person,
  index,
  isAvailable,
  isRemoving,
  onRemove,
  onHoverChange,
  onClick,
  isSelected,
  areSelected,
}: {
  person: string;
  index: number;
  isAvailable: boolean;
  isRemoving: boolean;
  onRemove: () => void;
  onHoverChange: (isHovering: boolean) => void;
  onClick: () => void;
  isSelected: boolean;
  areSelected: boolean;
}) {
  //  delay based on index
  const delay = (index % 4) * -0.1;

  const ChipContent = (
    <li
      style={{ animationDelay: `${delay}s` }}
      onMouseEnter={() => {
        if (window.matchMedia("(hover: hover)").matches) {
          onHoverChange(true);
        }
      }}
      onMouseLeave={() => onHoverChange(false)}
      onClick={() => {
        if (isRemoving) {
          onRemove();
        } else {
          onHoverChange(false);
          onClick();
        }
      }}
      className={cn(
        "relative flex w-fit touch-manipulation items-center justify-center rounded-full transition-[opacity,shadow] duration-200 hover:cursor-pointer",
        "px-3 py-1.5 text-base",
        "md:px-3 md:py-1 md:text-sm",
        "border border-transparent",
        "after:absolute after:-inset-1 after:content-['']",

        // Availability Styling
        !isAvailable && "bg-gray-200/25 line-through opacity-50",
        isAvailable && "bg-accent/25 text-accent-text opacity-100",

        // Selection Styling
        isSelected &&
          "bg-accent ring-accent ring-offset-background text-white ring-2 ring-offset-1",
        areSelected && !isSelected && "bg-gray-200/25",

        // Hover Styling
        !isRemoving && !isSelected && "hover:bg-accent hover:text-white",

        // Wiggle/Remove Styling
        isRemoving &&
          "animate-wiggle hover:bg-red scale-102 group hover:cursor-pointer hover:text-white hover:opacity-100 active:bg-red-400 md:scale-100",
      )}
    >
      <span
        className={cn(
          "transition-opacity duration-200",
          isRemoving && "group-hover:opacity-0",
        )}
      >
        {person}
      </span>

      {isRemoving && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <TrashIcon className="h-4 w-4" />
        </div>
      )}
    </li>
  );

  return ChipContent;
}
