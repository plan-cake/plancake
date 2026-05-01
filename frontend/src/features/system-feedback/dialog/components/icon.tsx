import { DialogType } from "@/features/system-feedback/type";
import { cn } from "@/lib/utils/classname";

type DialogIconProps = {
  dialogConfig: {
    icon: React.ComponentType<{ className?: string }>;
    iconStyle: string;
  };
  type?: DialogType;
  showIcon?: boolean;
};

export default function DialogIcon({
  dialogConfig,
  type = "info",
  showIcon = true,
}: DialogIconProps) {
  if (!showIcon) return null;

  const Icon = dialogConfig.icon;

  if (type === "warning") {
    return (
      <div
        className={cn(
          "aspect-square rounded-full text-center",
          dialogConfig.iconStyle,
        )}
      >
        <div className="text-[48px]">!</div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-full p-4", dialogConfig.iconStyle)}>
      {Icon && <Icon className="h-10 w-10" />}
    </div>
  );
}
