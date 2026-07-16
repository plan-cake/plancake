"use client";

import { useCallback, useEffect, useState } from "react";

import {
  GRID_PAGE_DAYS_DESKTOP_KEY,
  GRID_PAGE_DAYS_DESKTOP_OPTIONS,
  GRID_PAGE_DAYS_MOBILE_KEY,
  GRID_PAGE_DAYS_MOBILE_OPTIONS,
} from "@/features/event/grid/lib/constants";
import useCheckMobile from "@/lib/hooks/use-check-mobile";

export default function useGridPageDays() {
  const isMobile = useCheckMobile();

  const gridPageDaysOptions: number[] = isMobile
    ? GRID_PAGE_DAYS_MOBILE_OPTIONS
    : GRID_PAGE_DAYS_DESKTOP_OPTIONS;

  const localStorageKey = isMobile
    ? GRID_PAGE_DAYS_MOBILE_KEY
    : GRID_PAGE_DAYS_DESKTOP_KEY;

  const validateValue = useCallback(
    (value: string | null) => {
      if (!value) return gridPageDaysOptions[0];
      const parsedValue = parseInt(value);
      return gridPageDaysOptions.includes(parsedValue)
        ? parsedValue
        : gridPageDaysOptions[0];
    },
    [gridPageDaysOptions],
  );

  const [gridPageDays, setGridPageDaysState] = useState<number>(
    gridPageDaysOptions[0],
  );

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(localStorageKey);
      setGridPageDaysState(validateValue(storedValue));
    } catch {
      setGridPageDaysState(gridPageDaysOptions[0]);
    }
  }, [localStorageKey, isMobile, gridPageDaysOptions, validateValue]);

  const setGridPageDays = (value: number) => {
    try {
      localStorage.setItem(localStorageKey, value.toString());
    } catch {
      // Ignore error
    }
    setGridPageDaysState(value);
  };

  const usingMaxGridPageDays =
    gridPageDays === Math.max(...gridPageDaysOptions);

  return {
    gridPageDays,
    gridPageDaysOptions,
    usingMaxGridPageDays,
    setGridPageDays,
  };
}
