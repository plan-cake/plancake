import HeaderSpacer from "@/features/header/components/header-spacer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col gap-4 px-6 pb-4">
      <HeaderSpacer />
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="bg-panel w-full rounded-3xl">
        <div className="p-4">
          <div className="bg-foreground/10 h-10 w-1/2 animate-pulse rounded-full" />
        </div>

        {/* 2. Skeleton for the Event Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-foreground/5 h-50 w-full animate-pulse rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
