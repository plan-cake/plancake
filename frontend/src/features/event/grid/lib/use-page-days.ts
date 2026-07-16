"use client";

import {
  GRID_PAGE_DAYS_DESKTOP_OPTIONS,
  GRID_PAGE_DAYS_MOBILE_OPTIONS,
  GRID_PAGE_DAYS_DESKTOP_KEY,
  GRID_PAGE_DAYS_MOBILE_KEY,
} from "@/features/event/grid/lib/constants";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function useGridPageDays() {
  const isMobile = useCheckMobile();

  const gridPageDaysOptions: number[] = isMobile
    ? GRID_PAGE_DAYS_MOBILE_OPTIONS
    : GRID_PAGE_DAYS_DESKTOP_OPTIONS;

  const validateValue = (value: string | null) => {
    if (!value) return gridPageDaysOptions[0];
    const parsedValue = parseInt(value);
    return gridPageDaysOptions.includes(parsedValue)
      ? parsedValue
      : gridPageDaysOptions[0];
  };

  const localStorageKey = isMobile
    ? GRID_PAGE_DAYS_MOBILE_KEY
    : GRID_PAGE_DAYS_DESKTOP_KEY;

  let storedValue: string | null = null;
  try {
    storedValue = localStorage.getItem(localStorageKey);
  } catch {}
  const gridPageDays = validateValue(storedValue);

  const setGridPageDays = (value: number) => {
    localStorage.setItem(localStorageKey, value.toString());
  };

  return { gridPageDays, gridPageDaysOptions, setGridPageDays };
}
