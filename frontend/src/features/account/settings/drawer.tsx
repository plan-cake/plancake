import { StandardDrawer } from "@/features/drawer";

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
      <StandardDrawer
        open={open}
        onOpenChange={setOpen}
        frostedGlass
        contentClassName="h-7/8"
        description="View and edit your account settings"
        title="Account Settings"
        trigger={trigger}
      >
        <div className="flex flex-1 flex-col overflow-y-auto">{content}</div>
      </StandardDrawer>
    </div>
  );
}
