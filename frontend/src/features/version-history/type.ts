type MajorVersionNumber = `v${number}.${number}`;
type MinorVersionNumber = `${MajorVersionNumber}.${number}`;

type ReleaseDate = {
  year: number; // full year, e.g., 2025
  month: number; // 1-indexed month, e.g., 1 for January
  day: number; // day of the month, e.g., 15
};

type VersionData = {
  releaseDate: ReleaseDate;
  added: string[];
  changed: string[];
  fixed: string[];
};

export type MinorVersionData = VersionData & {
  version: MinorVersionNumber;
};

export type MajorVersionData = VersionData & {
  version: MajorVersionNumber;
  minorVersions: MinorVersionData[];
};

export type VersionHistoryData = MajorVersionData[];
