import { VersionHistoryData } from "@/features/version-history/type";

export const VERSION_DATA: VersionHistoryData = [
  {
    version: "v0.1",
    releaseDate: { year: 2025, month: 10, day: 19 },
    added: [],
    changed: [],
    fixed: [],
    minorVersions: [
      {
        version: "v0.1.1",
        releaseDate: { year: 2025, month: 10, day: 22 },
        added: [],
        changed: [],
        fixed: [
          "Fixed broken redirect after event creation",
          "Fixed event editing error preventing updates",
        ],
      },
      {
        version: "v0.1.2",
        releaseDate: { year: 2025, month: 11, day: 2 },
        added: [],
        changed: ["Updated all buttons on the site to be more responsive"],
        fixed: [
          "Fixed an issue where painting the grid up to midnight would fill entire days",
          "Fixed event grid time display in different time zones",
          "Fixed an issue where remaining toasts would not disappear after dismissing one",
        ],
      },
    ],
  },
  {
    version: "v0.2",
    releaseDate: { year: 2026, month: 1, day: 16 },
    added: [
      "Added functionality for event participant removal",
      "Added a version history page",
    ],
    changed: [
      "Updated error handling across the site",
      "Updated certain parts of the event editor",
      "Improved readability of transparent components",
      "Temporarily disabled weekday events for fixes",
    ],
    fixed: ["Fixed the theme transition on the landing page"],
    minorVersions: [
      {
        version: "v0.2.1",
        releaseDate: { year: 2026, month: 1, day: 21 },
        added: [
          "Added custom titles and descriptions on link previews",
          "Added animations and page indicators for events with multi-page grids",
        ],
        changed: [
          "Updated the hovered timeslot on the results page for better visibility",
        ],
        fixed: [
          "Fixed touch interactions on the results page to allow for natural scrolling gestures",
        ],
      },
      {
        version: "v0.2.2",
        releaseDate: { year: 2026, month: 2, day: 2 },
        added: [
          "Added banners to results page for event status and participation levels",
        ],
        changed: [
          "Updated toasts to support persistent and temporary messages",
          "Temporarily disabled shift painting for fixes",
        ],
        fixed: [],
      },
    ],
  },
  {
    version: "v0.3",
    releaseDate: { year: 2026, month: 2, day: 14 },
    added: [
      "Added event participant previews to the dashboard",
      "Added a nickname to accounts for autofill when filling out availability",
      "Added the ability to filter attendees on the results page",
      "Added custom scrollbars",
    ],
    changed: [
      "Re-added weekday events with fixes to data handling",
      "Updated the dashboard layout, adding placeholder text and smarter tab logic",
    ],
    fixed: [
      "Fixed an issue where the user could attempt to log in while already logged in",
      "Fixed the display of version release dates",
      "Fixed the event title text wrapping on the results page",
      "Fixed the error messages on internal server errors",
    ],
    minorVersions: [
      {
        version: "v0.3.1",
        releaseDate: { year: 2026, month: 2, day: 26 },
        added: ["Added an icon for iOS home screen bookmarks"],
        changed: [
          "Updated the date picker for more intuitive date range selection",
          "Changed event participant name conflicts to be case-insensitive",
          "Increased toast lifetime for easier reading",
        ],
        fixed: ["Fixed an issue with layering order on the painting page"],
      },
      {
        version: "v0.3.2",
        releaseDate: { year: 2026, month: 3, day: 5 },
        added: [
          "Added a reminder to view all grid pages when filling out availability",
        ],
        changed: [
          "Updated dashboard to dynamically show more participants on each event",
          "Updated the version history page layout",
          "Updated the new event button to have dynamic styling",
          "Updated drawers across the site to be more interactive",
          "Updated selector drawer appearance to show more options at once",
          "Updated the layout of authentication-related pages",
        ],
        fixed: [
          "Fixed an issue where nicknames would attempt to autofill on initial save",
          "Fixed an issue where dialogs would look blurry on certain browsers",
        ],
      },
      {
        version: "v0.3.3",
        releaseDate: { year: 2026, month: 3, day: 27 },
        added: [
          "Added functionality for the header to shrink on mobile",
          "Added check marks to checkboxes for clarity",
          "Added focus rings to dropdowns for better accessibility",
        ],
        changed: [
          "Updated the dashboard to show the most recent events first",
          "Updated rate limits to apply on a per-user basis instead of by IP address",
          "Updated resend email button on initial registration for better feedback",
          "Updated the date picker to have an exit animation",
          "Increased the maximum event days from 30 to 64",
        ],
        fixed: [],
      },
    ],
  },
  {
    version: "v0.4",
    releaseDate: { year: 2026, month: 4, day: 6 },
    added: [
      "Added the ability to delete events on the dashboard",
      "Added the account settings page",
    ],
    changed: [
      "Updated the dark mode accent color",
      "Updated the event results page to reduce clutter",
      "Updated the appearance of events on the dashboard",
      "Updated the event grid to list the ending hour on the left axis",
      'Removed "Intended Duration" from events',
    ],
    fixed: [
      "Fixed an issue where an invalid custom event code would not show an error",
    ],
    minorVersions: [
      {
        version: "v0.4.1",
        releaseDate: { year: 2026, month: 4, day: 9 },
        added: [],
        changed: [
          "Updated the header on the attendees panel to display more relevant information",
          "Updated drawer components to have close buttons for accessibility",
          "Updated all icons on the site to be more consistent",
          "Updated the appearance of the date picker when selecting a range",
          "Adjusted the priority of banners shown on the results page",
        ],
        fixed: [
          "Fixed results grid hover behavior on mouse leave",
          "Fixed an issue where focused dropdowns would not display a focus ring",
        ],
      },
      {
        version: "v0.4.2",
        releaseDate: { year: 2026, month: 4, day: 10 },
        added: [],
        changed: [],
        fixed: [
          "Fixed the formatting of hovered timeslots for weekday events",
          "Fixed the banner message prompting users to add availability on mobile",
          "Fixed the attendee count display when there is only one participant",
        ],
      },
      {
        version: "v0.4.3",
        releaseDate: { year: 2026, month: 5, day: 9 },
        added: [
          "Added icons to the results grid to indicate the best times",
          "Added a share button to the results page",
          'Added a new theme picker, which includes a "Match System" option',
        ],
        changed: [
          'Updated the "Leave Event" button icon',
          "Adjusted the scroll functionality of the event grid",
          "Changed the color of event attendees on the results page",
        ],
        fixed: ["Fixed the drawer transition on the mobile results page"],
      },
      {
        version: "v0.4.4",
        releaseDate: { year: 2026, month: 6, day: 12 },
        added: [
          "Added a share menu to the results page",
          "Added a strict check for cookies being enabled",
        ],
        changed: [
          "Updated the mobile layout on the painting page and event editor",
          "Updated the appearance of event editor controls",
          "Removed default dates and times from the new event page",
        ],
        fixed: [],
      },
      {
        version: "v0.4.5",
        releaseDate: { year: 2026, month: 6, day: 29 },
        added: ["Added animations to the password strength criteria"],
        changed: [
          "Updated confirmation dialogs to display as drawers on mobile",
          "Updated loading page skeletons to be consistent with new page layouts",
          "Updated the authentication code checking rate limit to prevent lockouts",
        ],
        fixed: [
          "Fixed an issue where the mobile results page drawer would not display the footer when opened",
        ],
      },
      {
        version: "v0.4.6",
        releaseDate: { year: 2026, month: 7, day: 20 },
        added: [
          "Added error messages to length-limited text fields",
          "Added the share menu to dashboard events",
        ],
        changed: [
          "Updated time selector drawer titles",
          "Removed the grid preview dialog from the event editor",
        ],
        fixed: ["Fixed the trigger area of the event date selector"],
      },
    ],
  },
] as const;

export function getCurrentVersion(threeDigit = true): string {
  const latestMajor = VERSION_DATA.at(-1)!;
  if (latestMajor.minorVersions.length > 0) {
    return latestMajor.minorVersions[latestMajor.minorVersions.length - 1]
      .version;
  }
  return `${latestMajor.version}${threeDigit ? ".0" : ""}`;
}
