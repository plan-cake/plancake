"use client";
import { useEffect, useRef, useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ChevronRightIcon,
  ListChevronsDownUpIcon,
  ListChevronsUpDownIcon,
} from "lucide-react";

import ActionButton from "@/features/button/components/action";
import HeaderSpacer from "@/features/header/components/header-spacer";
import { useHeaderSize } from "@/features/header/context";
import {
  MajorVersionData,
  MinorVersionData,
  VersionHistoryData,
} from "@/features/version-history/type";
import { cn } from "@/lib/utils/classname";

export default function ClientPage({
  versionHistoryData,
}: {
  versionHistoryData: VersionHistoryData;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { topMarginClass } = useHeaderSize();

  // On load, scroll to the bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  // Section expansion management
  const allVersions = versionHistoryData.flatMap((version) => {
    const versions = [];
    if (version.bugFixes && version.bugFixes.length > 0) {
      versions.push(version.version);
    }
    if (version.minorVersions && version.minorVersions.length > 0) {
      versions.push(...version.minorVersions.map((minor) => minor.version));
    }
    return versions;
  });
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set(),
  );
  const allExpanded = expandedVersions.size === allVersions.length;

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(version)) {
        newSet.delete(version);
      } else {
        newSet.add(version);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedVersions(new Set(allVersions));
  };

  const collapseAll = () => {
    setExpandedVersions(new Set());
  };

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSpacer />
      <div
        className={cn(
          topMarginClass,
          "bg-background z-15 sticky flex w-full items-center justify-between px-6 py-2",
        )}
      >
        <h1 className="text-2xl font-bold">Version History</h1>
        <ActionButton
          buttonStyle="semi-transparent"
          icon={
            allExpanded ? (
              <ListChevronsDownUpIcon />
            ) : (
              <ListChevronsUpDownIcon />
            )
          }
          label={allExpanded ? "Collapse All" : "Expand All"}
          shrinkOnMobile
          onClick={allExpanded ? collapseAll : expandAll}
        />
      </div>
      <div className="mx-auto flex w-full flex-col gap-8 px-8 pt-2">
        {versionHistoryData.map((version, index) => {
          const isCurrent = index === versionHistoryData.length - 1;
          const hasMinorVersions =
            version.minorVersions && version.minorVersions.length > 0;

          return (
            <div
              className={
                isCurrent ? "bg-panel outline-panel outline-16 rounded-xl" : ""
              }
              key={version.version}
            >
              <MajorVersion
                key={version.version}
                versionData={version}
                isCurrent={isCurrent}
                isLast={isCurrent && !hasMinorVersions}
                extendLine={!isCurrent && !hasMinorVersions}
                isExpanded={expandedVersions.has(version.version)}
                toggleExpanded={toggleVersion}
              />
              {version.minorVersions &&
                version.minorVersions.map((minorVersion, minorIndex) => {
                  const isLastMinor =
                    minorIndex === version.minorVersions!.length - 1;

                  return (
                    <MinorVersion
                      key={minorVersion.version}
                      versionData={minorVersion}
                      isCurrent={isCurrent}
                      isLast={isCurrent && isLastMinor}
                      extendLine={!isCurrent && isLastMinor}
                      isExpanded={expandedVersions.has(minorVersion.version)}
                      toggleExpanded={toggleVersion}
                    />
                  );
                })}
            </div>
          );
        })}
        {/* Bottom div as a scroll reference, also adding bottom padding */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function TimelineSegment({
  version,
  isCurrent,
  isLast,
  extend,
}: {
  version?: string;
  isCurrent: boolean;
  isLast: boolean;
  extend: boolean;
}) {
  return (
    <div className="relative w-10 flex-shrink-0">
      {!isLast && (
        <div
          className={cn(
            "absolute left-[50%] top-4 z-0 h-[calc(100%+6px)] translate-x-[-50%] border-l-2",
            isCurrent ? "border-accent" : "border-foreground",
            extend ? "h-[calc(100%+6px+12px)]" : "",
          )}
        />
      )}
      {version ? (
        <div
          className={cn(
            "text-background absolute left-[50%] z-10 mb-1 w-fit translate-x-[-50%] rounded-full",
            isCurrent ? "bg-accent text-white" : "bg-foreground",
          )}
        >
          <h2 className="text-md px-2 font-bold">{version}</h2>
        </div>
      ) : (
        <div
          className={cn(
            "absolute left-[50%] z-10 mt-1.5 h-3 w-3 translate-x-[-50%] rounded-full",
            isCurrent ? "bg-accent" : "bg-foreground",
          )}
        ></div>
      )}
    </div>
  );
}

function MajorVersion({
  versionData,
  isCurrent,
  isLast,
  extendLine,
  isExpanded,
  toggleExpanded,
}: {
  versionData: MajorVersionData;
  isCurrent: boolean;
  isLast: boolean;
  extendLine: boolean;
  isExpanded: boolean;
  toggleExpanded: (version: string) => void;
}) {
  const releaseDate = new Date(
    Date.UTC(
      versionData.releaseDate.year,
      versionData.releaseDate.month,
      versionData.releaseDate.day,
    ),
  );
  const releaseDateString = releaseDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex">
      <TimelineSegment
        version={versionData.version}
        isCurrent={isCurrent}
        isLast={isLast}
        extend={extendLine}
      />
      <div className="w-full px-4">
        <div className="flex items-center gap-4">
          <span className="text-foreground/50 shrink-0 italic">
            {releaseDateString}
          </span>
          {!isCurrent && (
            <div className="border-foreground/50 w-full rounded-full border-t" />
          )}
        </div>
        <ul>
          {versionData.changes.map((change) => (
            <li key={change}>- {change}</li>
          ))}
        </ul>
        {versionData.bugFixes && versionData.bugFixes.length > 0 && (
          <Collapsible.Root
            open={isExpanded}
            onOpenChange={() => toggleExpanded(versionData.version)}
            className="ml-3"
          >
            <Collapsible.Trigger asChild>
              <div className="group mt-2 flex cursor-pointer items-center gap-2">
                <span className="font-semibold">Bug Fixes</span>
                <div
                  className={cn(
                    "transition-transform duration-200",
                    "group-hover:bg-accent/25 group-active:bg-accent/40 rounded-full p-1",
                    isExpanded && "rotate-90",
                  )}
                >
                  <ChevronRightIcon className="h-4 w-4" />
                </div>
              </div>
            </Collapsible.Trigger>
            <Collapsible.Content className="collapsible-content">
              <ul>
                {versionData.bugFixes!.map((bugFix) => (
                  <li key={bugFix}>- {bugFix}</li>
                ))}
              </ul>
            </Collapsible.Content>
          </Collapsible.Root>
        )}
      </div>
    </div>
  );
}

function MinorVersion({
  versionData,
  isCurrent,
  isLast,
  extendLine,
  isExpanded,
  toggleExpanded,
}: {
  versionData: MinorVersionData;
  isCurrent: boolean;
  isLast: boolean;
  extendLine: boolean;
  isExpanded: boolean;
  toggleExpanded: (version: string) => void;
}) {
  const releaseDate = new Date(
    Date.UTC(
      versionData.releaseDate.year,
      versionData.releaseDate.month,
      versionData.releaseDate.day,
    ),
  );
  const releaseDateString = releaseDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="mt-4 flex">
      <TimelineSegment
        isCurrent={isCurrent}
        isLast={isLast}
        extend={extendLine}
      />
      <div className="px-4">
        <Collapsible.Root
          open={isExpanded}
          onOpenChange={() => toggleExpanded(versionData.version)}
        >
          <Collapsible.Trigger asChild className="cursor-pointer">
            <div className="group flex items-center gap-2">
              <span className="font-bold">{versionData.version}</span>
              <span className="text-foreground/50 italic">
                {releaseDateString}
              </span>
              <div
                className={cn(
                  "transition-transform duration-200",
                  "group-hover:bg-accent/25 group-active:bg-accent/40 rounded-full p-1",
                  isExpanded && "rotate-90",
                )}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </div>
            </div>
          </Collapsible.Trigger>
          <Collapsible.Content className="collapsible-content">
            <ul>
              {versionData.changes.map((change) => (
                <li key={change}>- {change}</li>
              ))}
            </ul>
          </Collapsible.Content>
        </Collapsible.Root>
      </div>
    </div>
  );
}
