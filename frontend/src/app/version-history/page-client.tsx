"use client";
import { cloneElement, useEffect, useMemo, useRef, useState } from "react";

import * as Collapsible from "@radix-ui/react-collapsible";
import {
  ArrowDownIcon,
  BugIcon,
  ChevronRightIcon,
  ListChevronsDownUpIcon,
  ListChevronsUpDownIcon,
  PlusCircleIcon,
  WrenchIcon,
} from "lucide-react";

import ActionButton from "@/features/button/components/action";
import HeaderSpacer from "@/features/header/components/header-spacer";
import { useHeader } from "@/features/header/context";
import {
  MajorVersionData,
  MinorVersionData,
  VersionHistoryData,
} from "@/features/version-history/type";
import { cn } from "@/lib/utils/classname";

export default function ClientPage({
  versionHistoryData,
  currentVersion,
}: {
  versionHistoryData: VersionHistoryData;
  currentVersion: string;
}) {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { expand } = useHeader();

  // On load, scroll to the bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });

    // Also expand the header on load
    expand();
  }, [expand]);

  // Section expansion management
  const allVersions = useMemo(() => {
    const versions = new Set<string>();
    versionHistoryData.forEach((version) => {
      if (
        version.added.length > 0 ||
        version.changed.length > 0 ||
        version.fixed.length > 0
      ) {
        versions.add(version.version);
      }
      version.minorVersions.forEach((minor) => versions.add(minor.version));
    });
    return versions;
  }, [versionHistoryData]);
  const [expandedVersions, setExpandedVersions] = useState<Set<string>>(
    new Set([currentVersion]),
  );
  const allExpanded = expandedVersions.size === allVersions.size;

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

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedVersions(new Set());
    } else {
      setExpandedVersions(new Set(allVersions));
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <HeaderSpacer />
      <div
        className={cn(
          "sticky top-[var(--header-height)]",
          "flex w-full items-center justify-between",
          "bg-background z-15 px-6 pb-2 pt-4",
        )}
      >
        <h1 className="text-2xl font-bold">Version History</h1>
      </div>
      <div className="flex flex-col gap-4 px-6">
        <div className="flex justify-between">
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
            onClick={handleToggleAll}
          />
          <ActionButton
            buttonStyle="semi-transparent"
            icon={<ArrowDownIcon />}
            label="Scroll to Latest"
            shrinkOnMobile
            onClick={() => {
              // State logic within the button cancels the scroll unless it's delayed
              setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 0);
            }}
          />
        </div>
        <div className="mx-auto flex w-full flex-col gap-8 px-2">
          {versionHistoryData.map((version, index) => {
            const isCurrent = index === versionHistoryData.length - 1;
            const hasMinorVersions = version.minorVersions.length > 0;

            return (
              <div
                className={
                  isCurrent
                    ? "bg-panel outline-panel outline-16 rounded-xl"
                    : ""
                }
                key={version.version}
              >
                <Version
                  key={version.version}
                  versionData={version}
                  isMajor={true}
                  isCurrent={isCurrent}
                  isLast={isCurrent && !hasMinorVersions}
                  extendLine={!isCurrent && !hasMinorVersions}
                  isExpanded={expandedVersions.has(version.version)}
                  toggleExpanded={toggleVersion}
                />
                {version.minorVersions.map((minorVersion, minorIndex) => {
                  const isLastMinor =
                    minorIndex === version.minorVersions.length - 1;

                  return (
                    <Version
                      key={minorVersion.version}
                      versionData={minorVersion}
                      isMajor={false}
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
          <h2 className="px-2 font-bold">{version}</h2>
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

function Version({
  versionData,
  isMajor,
  isCurrent,
  isLast,
  extendLine,
  isExpanded,
  toggleExpanded,
}: {
  versionData: MajorVersionData | MinorVersionData;
  isMajor: boolean;
  isCurrent: boolean;
  isLast: boolean;
  extendLine: boolean;
  isExpanded: boolean;
  toggleExpanded: (version: string) => void;
}) {
  const releaseDate = new Date(
    Date.UTC(
      versionData.releaseDate.year,
      versionData.releaseDate.month - 1, // Adjust to 0-indexed month
      versionData.releaseDate.day,
    ),
  );
  const releaseDateString = releaseDate.toLocaleDateString(
    undefined,
    isMajor
      ? {
          year: "numeric",
          month: "long",
          day: "numeric",
          timeZone: "UTC",
        }
      : {
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        },
  );

  const hasChanges = useMemo(() => {
    return (
      versionData.added.length > 0 ||
      versionData.changed.length > 0 ||
      versionData.fixed.length > 0
    );
  }, [versionData]);
  const versionTag = useMemo(() => {
    if (isMajor && (versionData as MajorVersionData).tag) {
      return (versionData as MajorVersionData).tag;
    }
    return undefined;
  }, [isMajor, versionData]);

  const HeaderType = hasChanges ? "button" : "div";

  const header = (
    <HeaderType className="group flex w-full items-center gap-2">
      {!isMajor && <span className="font-bold">{versionData.version}</span>}
      {versionTag && (
        <div
          className={cn(
            "bg-lion text-violet text-nowrap rounded-full px-1.5 py-0.5 text-xs font-semibold",
          )}
        >
          {versionTag}
        </div>
      )}
      <span className="text-foreground/50 shrink-0 italic">
        {releaseDateString}
      </span>
      {hasChanges && (
        <div
          className={cn(
            "transition-transform duration-200",
            "group-hover:bg-accent/25 group-active:bg-accent/40 rounded-full p-1",
            isExpanded && "rotate-90",
          )}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </div>
      )}
      {isMajor && !isCurrent && (
        <div className="border-foreground/50 w-full rounded-full border-t" />
      )}
    </HeaderType>
  );

  return (
    <div className={cn("flex", !isMajor && "mt-4")}>
      <TimelineSegment
        version={isMajor ? versionData.version : undefined}
        isCurrent={isCurrent}
        isLast={isLast}
        extend={extendLine}
      />
      <div className="w-full px-4">
        {hasChanges ? (
          <Collapsible.Root
            open={isExpanded}
            onOpenChange={() => toggleExpanded(versionData.version)}
            className="flex flex-col gap-1"
          >
            <Collapsible.Trigger asChild className="cursor-pointer">
              {header}
            </Collapsible.Trigger>
            <Collapsible.Content className="collapsible-content">
              <ChangeList versionData={versionData} />
            </Collapsible.Content>
          </Collapsible.Root>
        ) : (
          header
        )}
      </div>
    </div>
  );
}

function ChangeList({
  versionData,
}: {
  versionData: MajorVersionData | MinorVersionData;
}) {
  return (
    <ul className="flex flex-col gap-1">
      <ChangeSection
        title="Added"
        icon={<PlusCircleIcon />}
        changes={versionData.added}
      />
      <ChangeSection
        title="Changed"
        icon={<WrenchIcon />}
        changes={versionData.changed}
      />
      <ChangeSection
        title="Fixed"
        icon={<BugIcon />}
        changes={versionData.fixed}
      />
    </ul>
  );
}

function ChangeSection({
  title,
  icon,
  changes,
}: {
  title: string;
  icon: React.ReactNode;
  changes: string[];
}) {
  if (changes.length === 0) return null;

  const iconElement = cloneElement(
    icon as React.ReactElement<{ className: string }>,
    {
      className: "h-3.5 w-3.5 shrink-0",
    },
  );

  return (
    <div>
      <span className="font-bold opacity-75">{title}</span>
      <div className="flex flex-col gap-1">
        {changes.map((change) => (
          <li key={change} className="flex items-start gap-2">
            <div className="mt-[3px]">{iconElement}</div>
            <div className="leading-tight">{change}</div>
          </li>
        ))}
      </div>
    </div>
  );
}
