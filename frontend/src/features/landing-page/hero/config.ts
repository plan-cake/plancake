export type HeroImageView = "specific-dates" | "weekly";
export type HeroImageTheme = "light" | "dark";
export type HeroImageVariant = { src: string; width: number; height: number };

export const HERO_IMAGES: Record<
  HeroImageView,
  Record<"desktop" | "mobile", Record<HeroImageTheme, HeroImageVariant>>
> = {
  "specific-dates": {
    desktop: {
      light: {
        src: "/images/specific-desktop-light.png",
        width: 1440,
        height: 725,
      },
      dark: {
        src: "/images/specific-desktop-dark.png",
        width: 1440,
        height: 725,
      },
    },
    mobile: {
      light: {
        src: "/images/specific-mobile-light.png",
        width: 1204,
        height: 2141,
      },
      dark: {
        src: "/images/specific-mobile-dark.png",
        width: 1204,
        height: 2141,
      },
    },
  },
  weekly: {
    desktop: {
      light: {
        src: "/images/weekly-desktop-light.png",
        width: 1440,
        height: 725,
      },
      dark: {
        src: "/images/weekly-desktop-dark.png",
        width: 1440,
        height: 725,
      },
    },
    mobile: {
      light: {
        src: "/images/weekly-mobile-light.png",
        width: 1204,
        height: 2141,
      },
      dark: {
        src: "/images/weekly-mobile-dark.png",
        width: 1204,
        height: 2141,
      },
    },
  },
};
