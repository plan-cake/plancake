import { readFile } from "fs/promises";
import path from "path";

import Markdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";

import HeaderSpacer from "@/features/header/components/header-spacer";
import { cn } from "@/lib/utils/classname";

const CONTENT_DIR = path.join(process.cwd(), "src/features/legal/content");

// The page title is the only <h1>, so markdown headings render one level down
const components: Components = {
  h1: ({ children }) => (
    <h2 className="mb-2 mt-8 text-xl font-bold">{children}</h2>
  ),
  h2: ({ children }) => (
    <h3 className="mb-2 mt-6 text-lg font-bold">{children}</h3>
  ),
  h3: ({ children }) => <h4 className="mb-1 mt-4 font-bold">{children}</h4>,
  p: ({ children }) => <p className="my-4">{children}</p>,
  ul: ({ children }) => (
    <ul className="my-3 flex list-disc flex-col gap-2 pl-6">{children}</ul>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-accent-text underline"
      {...(href?.startsWith("http") && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-foreground border p-2 text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-foreground border p-2 align-top">{children}</td>
  ),
};

export default async function LegalDocument({
  title,
  file,
}: {
  title: string;
  file: string;
}) {
  const markdown = await readFile(path.join(CONTENT_DIR, file), "utf8");

  return (
    <div className="flex flex-col px-6 pb-4">
      <HeaderSpacer />
      <div
        className={cn(
          "sticky top-[var(--header-height)]",
          "bg-background z-15 pb-2 pt-4",
        )}
      >
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      <article>
        <Markdown remarkPlugins={[remarkGfm]} components={components}>
          {markdown}
        </Markdown>
      </article>
    </div>
  );
}
