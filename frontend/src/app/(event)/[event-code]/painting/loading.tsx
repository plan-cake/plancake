import HeaderSpacer from "@/features/header/components/header-spacer";

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />

      <div className="flex w-full flex-wrap items-center justify-between md:flex-row">
        <div className="bg-loading h-12 w-1/2 rounded-3xl" />

        <div className="bg-loading h-10 w-40 rounded-full" />
      </div>

      <div className="mb-8 flex h-full flex-col gap-4 md:mb-0 md:flex-row">
        <div className="h-fit w-full shrink-0 space-y-6 overflow-y-auto md:w-80">
          <div className="space-y-3">
            <div className="bg-loading h-8 w-3/4 rounded-3xl" />
            <div className="bg-loading h-8 w-1/2 rounded-3xl" />
          </div>
          <div className="h-70 bg-loading hidden rounded-3xl md:block" />
          <div className="bg-loading h-20 rounded-3xl" />
        </div>

        <div className="bg-loading h-96 w-full rounded-3xl" />
      </div>
    </div>
  );
}
