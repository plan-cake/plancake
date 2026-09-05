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
        width: 2880,
        height: 1622,
      },
      dark: {
        src: "/images/specific-desktop-dark.png",
        width: 2880,
        height: 1618,
      },
    },
    mobile: {
      light: {
        src: "/images/specific-mobile-light.png",
        width: 1206,
        height: 2622,
      },
      dark: {
        src: "/images/specific-mobile-dark.png",
        width: 1206,
        height: 2622,
      },
    },
  },
  weekly: {
    desktop: {
      light: {
        src: "/images/weekly-desktop-light.png",
        width: 2880,
        height: 1626,
      },
      dark: {
        src: "/images/weekly-desktop-dark.png",
        width: 2880,
        height: 1622,
      },
    },
    mobile: {
      light: {
        src: "/images/weekly-mobile-light.png",
        width: 1206,
        height: 2622,
      },
      dark: {
        src: "/images/weekly-mobile-dark.png",
        width: 1206,
        height: 2622,
      },
    },
  },
};
