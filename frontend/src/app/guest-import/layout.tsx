import { Metadata } from "next";

import { constructMetadata } from "@/lib/utils/construct-metadata";

export function generateMetadata(): Metadata {
  return constructMetadata(
    "Guest Import",
    "Transfer guest data into your account for easy access across devices.",
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
