import { Metadata } from "next";

import LegalDocument from "@/features/legal/components/legal-document";
import { constructMetadata } from "@/lib/utils/construct-metadata";

const TITLE = "Terms of Use";

export function generateMetadata(): Metadata {
  return constructMetadata(TITLE, "Read Plancake's Terms of Use.");
}

export default function Page() {
  return <LegalDocument title={TITLE} file="terms.md" />;
}
