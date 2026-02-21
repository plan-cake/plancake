import { createContext, useContext, ReactNode } from "react";

import { ResultsInformation } from "@/features/event/results/types";
import { useEventResults } from "@/features/event/results/use-results";

type ResultsContextType = ReturnType<typeof useEventResults>;

const ResultsContext = createContext<ResultsContextType | null>(null);

type ResultsProviderProps = {
  children: ReactNode;
  initialData: ResultsInformation;
};

export function ResultsProvider({
  children,
  initialData,
}: ResultsProviderProps) {
  const resultsState = useEventResults(initialData);

  return (
    <ResultsContext.Provider value={resultsState}>
      {children}
    </ResultsContext.Provider>
  );
}

export function useResultsContext() {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error("useResultsContext must be used within a ResultsProvider");
  }
  return context;
}
