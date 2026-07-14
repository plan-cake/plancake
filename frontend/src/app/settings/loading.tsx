import HeaderSpacer from "@/features/header/components/header-spacer";

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />

      <div className="bg-background flex w-full flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-foreground/60 text-sm">
          Manage your account settings and preferences!
        </p>
      </div>

      <div className="mt-2 flex flex-col gap-6 md:flex-row md:gap-12">
        <div className="bg-loading h-11 w-full rounded-3xl md:w-64" />
        <div className="bg-loading h-68 w-full max-w-2xl rounded-3xl" />
      </div>
    </div>
  );
}
