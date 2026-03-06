import { VersionHistoryData } from "@/features/version-history/type";

export function getVersionHistoryData(): VersionHistoryData {
  return [
    {
      version: "v0.1",
      releaseDate: { year: 2025, month: 9, day: 19 },
      changes: ["Initial beta release"],
      minorVersions: [
        {
          version: "v0.1.1",
          releaseDate: { year: 2025, month: 9, day: 22 },
          changes: [
            "Fixed broken redirect after event creation",
            "Fixed event editing error preventing updates",
          ],
        },
        {
          version: "v0.1.2",
          releaseDate: { year: 2025, month: 10, day: 2 },
          changes: [
            "Updated all buttons on the site to be more responsive",
            "Fixed an issue where painting the grid up to midnight would fill entire days",
            "Fixed event grid time display in different time zones",
            "Fixed an issue where remaining toasts would not disappear after dismissing one",
          ],
        },
      ],
    },
    {
      version: "v0.2",
      releaseDate: { year: 2026, month: 0, day: 16 },
      changes: [
        "Added functionality for event participant removal",
        "Added a version history page",
        "Updated error handling across the site",
        "Updated certain parts of the event editor",
        'Improved readability of transparent components',
        "Temporarily disabled weekday events for fixes",
      ],
      bugFixes: ["Fixed the theme transition on the landing page"],
      minorVersions: [
        {
          version: "v0.2.1",
          releaseDate: { year: 2026, month: 0, day: 21 },
          changes: [
            "Added custom titles and descriptions on link previews",
            "Added animations and page indicators for events with multi-page grids",
            "Updated the hovered timeslot on the results page for better visibility",
            "Fixed touch interactions on the results page to allow for natural scrolling gestures",
          ],
        },
        {
          version: "v0.2.2",
          releaseDate: { year: 2026, month: 1, day: 2 },
          changes: [
            "Added banners to results page for event status and participation levels",
            "Updated toasts to support persistent and temporary messages",
            "Temporarily disabled shift painting for fixes",
          ],
        },
      ],
    },
    {
      version: "v0.3",
      releaseDate: { year: 2026, month: 1, day: 14 },
      changes: [
        "Added event participant previews to the dashboard",
        "Added a nickname to accounts for autofill when filling out availability",
        "Added the ability to filter attendees on the results page",
        "Added custom scrollbars",
        "Re-added weekday events with fixes to data handling",
        "Updated the dashboard layout, adding placeholder text and smarter tab logic",
      ],
      bugFixes: [
        "Fixed an issue where the user could attempt to log in while already logged in",
        "Fixed the display of version release dates",
        "Fixed the event title text wrapping on the results page",
        "Fixed the error messages on internal server errors",
      ],
      minorVersions: [
        {
          version: "v0.3.1",
          releaseDate: { year: 2026, month: 1, day: 26 },
          changes: [
            "Added an icon for iOS home screen bookmarks",
            "Updated the date picker for more intuitive date range selection",
            "Changed event participant name conflicts to be case-insensitive",
            "Increased toast lifetime for easier reading",
            "Fixed an issue with layering order on the painting page",
          ],
        },
        {
          version: "v0.3.2",
          releaseDate: { year: 2026, month: 2, day: 5 },
          changes: [
            "Added a reminder to view all grid pages when filling out availability",
            "Updated dashboard to dynamically show more participants on each event",
            "Updated the version history page layout",
            "Updated the new event button to have dynamic styling",
            "Updated drawers across the site to be more interactive",
            "Updated selector drawer appearance to show more options at once",
            "Updated the layout of authentication-related pages",
            "Fixed an issue where nicknames would attempt to autofill on initial save",
            "Fixed an issue where dialogs would look blurry on certain browsers",
          ],
        }
      ],
    },
  ];
}

export function getCurrentVersion(): string {
  const history = getVersionHistoryData();
  const latestMajor = history[history.length - 1];
  if (latestMajor.minorVersions && latestMajor.minorVersions.length > 0) {
    return latestMajor.minorVersions[latestMajor.minorVersions.length - 1]
      .version;
  }
  return `${latestMajor.version}.0`;
}
