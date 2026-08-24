type MajorVersionNumber = `v${number}.${number}`;
type MinorVersionNumber = `${MajorVersionNumber}.${number}`;

type ReleaseDate = {
    year: number; // full year, e.g., 2025
    month: number; // 0-indexed month, e.g., 0 for January
    day: number; // day of the month, e.g., 15
};

export type MinorVersionData = {
    version: MinorVersionNumber;
    releaseDate: ReleaseDate;
    changes: string[];
};

export type MajorVersionData = {
    version: MajorVersionNumber;
    releaseDate: ReleaseDate;
    changes: string[];
    bugFixes: string[];
    minorVersions: MinorVersionData[];
};

export type VersionHistoryData = MajorVersionData[];