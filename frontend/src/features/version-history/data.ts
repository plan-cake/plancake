import { VersionHistoryData } from "@/features/version-history/type";

export const VERSION_DATA: VersionHistoryData = [
  {
    version: "v0.1",
    releaseDate: { year: 2025, month: 10, day: 19 },
    tag: "Beta Release",
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
          "Creating an event now redirects to the correct page",
          "Editing an event no longer fails by checking its own code for availability",
        ],
      },
      {
        version: "v0.1.2",
        releaseDate: { year: 2025, month: 11, day: 2 },
        added: [],
        changed: ["All buttons on the site are now more responsive"],
        fixed: [
          "Painting the grid up to midnight no longer fills entire days",
          "Event grid times now display correctly in different time zones",
          "Remaining toasts no longer freeze after dismissing one",
        ],
      },
    ],
  },
  {
    version: "v0.2",
    releaseDate: { year: 2026, month: 1, day: 16 },
    added: [
      "Attendees can now leave events",
      "Event creators can now remove attendees from events",
      "This version history page was added",
    ],
    changed: [
      "Error handling is now much more robust and helpful",
      "Translucent components are now more opaque",
      "Theme transition timing is now more consistent on the landing page",
      "Weekday events were temporarily disabled for fixes",
    ],
    fixed: [],
    minorVersions: [
      {
        version: "v0.2.1",
        releaseDate: { year: 2026, month: 1, day: 21 },
        added: [
          "Link previews now include custom titles and descriptions",
          "Events with multi-page grids now have an indicator and animations when switching pages",
        ],
        changed: [
          "Hovered timeslots on the results grid were redesigned for better visibility",
        ],
        fixed: ["The results grid no longer prevents the page from scrolling"],
      },
      {
        version: "v0.2.2",
        releaseDate: { year: 2026, month: 2, day: 2 },
        added: [
          "The results page now has banners for event status and participation",
        ],
        changed: [
          "Painting by shift-clicking was temporarily disabled for fixes",
        ],
        fixed: [],
      },
    ],
  },
  {
    version: "v0.3",
    releaseDate: { year: 2026, month: 2, day: 14 },
    added: [
      "The dashboard now shows a preview of attendees on each event",
      "Accounts can now save a nickname for autofill when adding availability",
      "Attendees can now be filtered by clicking them on the results page",
      "Scrollbars were customized to fit the site's theme",
    ],
    changed: [
      "Weekday events were re-enabled with fixes to timezone handling",
      "The dashboard now has placeholder text and prioritizes populated tabs",
    ],
    fixed: [
      "Users can no longer attempt to log in while already logged in",
      "Version release dates now ignore timezones",
      "The event title no longer wraps on the results page",
      "Internal server errors are now caught properly",
    ],
    minorVersions: [
      {
        version: "v0.3.1",
        releaseDate: { year: 2026, month: 2, day: 26 },
        added: ["An icon for iOS home screen bookmarks was added"],
        changed: [
          "Date range selection is now much more intuitive",
          "Event attendee names must now be case-insensitively unique",
          "Toast lifetime was increased",
        ],
        fixed: [
          "The painting page no longer displays grid times above the submit button",
        ],
      },
      {
        version: "v0.3.2",
        releaseDate: { year: 2026, month: 3, day: 5 },
        added: [
          "The painting page now reminds users to view all pages when submitting",
        ],
        changed: [
          "The dashboard now dynamically shows more participants depending on screen size",
          "The layout on this page was updated",
          "The new event button now has dynamic styling based on the current page",
          "Drawers across the site are now more interactive",
          "Mobile selectors were condensed to show more options at once",
          "Authentication-related pages now have a more consistent layout",
        ],
        fixed: [
          "Nicknames no longer attempt to autofill on availability submission",
          "Dialogs are no longer blurry on certain browsers",
        ],
      },
      {
        version: "v0.3.3",
        releaseDate: { year: 2026, month: 3, day: 27 },
        added: ["The header now shrinks on mobile when scrolling"],
        changed: [
          "Dashboard events now show the most recently created first",
          "The event day limit was increased from 30 to 64",
          "Rate limits now apply on a per-user basis instead of by IP address",
          "The resend email button for registration now displays a cooldown timer",
          "The date picker now has an exit animation",
          "Checkboxes now have check marks",
          "Dropdowns now have focus rings",
        ],
        fixed: [],
      },
    ],
  },
  {
    version: "v0.4",
    releaseDate: { year: 2026, month: 4, day: 6 },
    added: [
      "Events can now be deleted from the dashboard",
      "Users can now manage account settings on a dedicated page",
    ],
    changed: [
      "The dark mode accent color was updated to be less harsh",
      "The event results page was redesigned to reduce clutter",
      "Dashboard events now have proper hover and active states",
      "The event grid time axis now displays the ending hour",
      '"Intended Duration" was removed from events',
    ],
    fixed: ["Invalid custom event codes no longer hide errors"],
    minorVersions: [
      {
        version: "v0.4.1",
        releaseDate: { year: 2026, month: 4, day: 9 },
        added: [],
        changed: [
          "The attendees panel header now displays more relevant information",
          "All drawers now have close buttons for accessibility",
          "All icons on the site had their style updated",
          "The date picker now displays a continuous highlight when selecting a range",
          "Results page banner priorities were adjusted to emphasize no mutual times",
        ],
        fixed: [
          "The results grid now resets the hovered timeslot when the mouse leaves the grid",
          "Dropdown focus rings are no longer invisible",
        ],
      },
      {
        version: "v0.4.2",
        releaseDate: { year: 2026, month: 4, day: 10 },
        added: [],
        changed: [],
        fixed: [
          "The hovered timeslot format was fixed for weekday events",
          'The "add your availability" banner message was fixed to match the mobile layout',
          "The attendee count is no longer plural for one attendee",
        ],
      },
      {
        version: "v0.4.3",
        releaseDate: { year: 2026, month: 5, day: 9 },
        added: [
          "The results grid now displays icons to indicate the best times",
          "The results page now has a share button",
          'The theme picker was updated, including a new "System" option',
        ],
        changed: [
          'The "Leave Event" button icon was updated',
          "The results page now only scrolls the grid instead of the entire page",
          "Event attendees are now a different color",
        ],
        fixed: [
          "The mobile results drawer no longer moves down when transitioning",
        ],
      },
      {
        version: "v0.4.4",
        releaseDate: { year: 2026, month: 6, day: 12 },
        added: [
          "The results page now has a share menu",
          "A strict check that cookies are enabled was added",
        ],
        changed: [
          "The painting page and event editor now have fixed footers on mobile",
          "Event editor controls are now more consistent with the rest of the site",
          "The new event page now starts with nothing selected",
        ],
        fixed: [],
      },
      {
        version: "v0.4.5",
        releaseDate: { year: 2026, month: 6, day: 29 },
        added: ["Password strength criteria had transitions added"],
        changed: [
          "Confirmation dialogs now display as drawers on mobile",
          "Loading page skeletons were updated to match new page layouts",
          "The authentication code checking rate limit was loosened",
        ],
        fixed: [
          "The mobile results drawer footer no longer disappears when opened",
        ],
      },
      {
        version: "v0.4.6",
        releaseDate: { year: 2026, month: 7, day: 20 },
        added: [
          "Length-limited text fields now display errors when over the limit",
          "The event share menu can now be opened from the dashboard",
        ],
        changed: [
          "The time selector drawer titles were customized",
          "The grid preview dialog was removed from the event editor",
        ],
        fixed: [
          "The event date selector trigger area now matches the button size",
        ],
      },
    ],
  },
  {
    version: "v0.5",
    releaseDate: { year: 2026, month: 8, day: 30 },
    added: [
      "The results page now updates in real-time without the need to refresh",
      "A filter for minimum available attendees was added to the results page",
      "Guest data can now be imported into an account",
      "Tooltips were added across the site",
      "A transition between the results and painting pages was added",
      "Toggling the site theme now has a smooth transition",
      "A feedback form link was added to the landing page footer",
      'A "Skip to Content" button was added',
      'An "Expand/Collapse All" button was added to the version history page',
    ],
    changed: [
      "Toasts on mobile were reworked to appear from the top of the screen",
      "Timeslots not included in an event had their design updated",
      "Results page banners now prompt event creators to share their event first",
      "Results page text was updated to match mobile actions",
      "Event codes are now case-insensitive",
    ],
    fixed: [],
    minorVersions: [
      {
        version: "v0.5.1",
        releaseDate: { year: 2026, month: 9, day: 5 },
        added: [
          "Icons were added to event-related pages and account settings",
          "Invisible CAPTCHA verifications were implemented",
          "Email verification pages now display links to Gmail and Outlook",
        ],
        changed: [
          "The share menu QR code is now initially hidden",
          "The header shrinking animation is now tied to scroll progress",
          "Categorized and rewrote version history changes",
        ],
        fixed: [
          "Header submenus are now scaled correctly",
          "Header buttons no longer shift when switching pages",
        ],
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
