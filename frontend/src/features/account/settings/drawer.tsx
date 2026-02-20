import { BaseDrawer } from "@/components/layout/base-drawer";

export default function AccountSettingsDrawer({
  children: trigger,
  content,
  open,
  setOpen,
}: {
  children?: React.ReactNode;
  content: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  return (
    <div>
      {trigger}
      <BaseDrawer
        open={open}
        onOpenChange={setOpen}
        frostedGlass
        contentClassName="h-7/8"
        description="View and edit your account settings"
        title={"Account Settings"}
      >
        <div className="flex flex-1 flex-col overflow-y-auto">{content}</div>
      </BaseDrawer>
    </div>
  );
}
