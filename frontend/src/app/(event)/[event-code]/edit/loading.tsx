import HeaderSpacer from "@/features/header/components/header-spacer";

export default function Loading() {
  return (
    <div className="flex animate-pulse flex-col space-y-4 pl-6 pr-6">
      <HeaderSpacer />

      <div className="flex w-full flex-wrap items-center justify-between md:flex-row">
        <div className="bg-loading h-12 w-3/4 rounded-3xl md:w-1/2" />
        <div className="w-50 bg-loading hidden h-10 rounded-full" />
      </div>

      <div className="grid w-full grid-cols-1 grid-rows-[auto] gap-y-4 md:grow md:grid-cols-[200px_auto] md:grid-rows-[auto_auto] md:gap-x-4 md:gap-y-4">
        <div className="bg-loading hidden h-20 rounded-3xl md:block" />
        <div className="bg-loading col-span-3 hidden h-20 rounded-3xl md:block" />
        <div className="bg-loading hidden h-20 rounded-3xl md:col-start-1 md:row-start-2 md:block" />
        <div className="h-120 bg-loading hidden rounded-3xl md:col-span-10 md:col-start-2 md:row-span-10 md:row-start-2 md:block" />
        <div className="bg-loading hidden h-60 rounded-3xl md:col-start-1 md:row-start-11 md:block" />

        <div className="bg-loading h-20 w-3/4 rounded-3xl md:hidden" />
        <div className="bg-loading h-20 w-3/4 rounded-3xl md:hidden" />
        <div className="h-100 bg-loading rounded-3xl md:hidden" />
      </div>
    </div>
  );
}
