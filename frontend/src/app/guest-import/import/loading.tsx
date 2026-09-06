import HeaderSpacer from "@/features/header/components/header-spacer";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col gap-4 px-6 pb-4">
      <HeaderSpacer />
      <h1 className="text-2xl font-bold">Guest Import Review</h1>

      <div className="hidden h-9 md:block" />

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="bg-panel w-full rounded-3xl">
          <div className="p-2">
            <div className="space-y-2">
              <div className="h-7" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background h-10 w-full animate-pulse rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
        <div className="bg-panel w-full rounded-3xl">
          <div className="p-2">
            <div className="space-y-2">
              <div className="h-7" />
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-background h-15 w-full animate-pulse rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
