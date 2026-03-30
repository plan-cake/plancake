import HeaderSpacer from "@/features/header/components/header-spacer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col gap-4 px-6 pb-4">
      <HeaderSpacer />
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="bg-panel h-45 w-full rounded-3xl" />
    </div>
  );
}
