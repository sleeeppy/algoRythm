import { parsePost } from "./markdown.ts";
export type { Entry, EntryLink, RichColor, RichSpan } from "./types.ts";
import type { Entry } from "./types.ts";

const files = import.meta.glob("../posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const sources = new Map<string, string>();
for (const [file, source] of Object.entries(files)) {
  const stamp = file.match(/(\d{8})\.md$/)?.[1];
  if (stamp) sources.set(stamp, source as string);
}

export const entries: Entry[] = [...sources.values()]
  .map((source) => parsePost(source))
  .sort((left, right) => right.stamp.localeCompare(left.stamp));

export function rawPost(id: string) {
  return sources.get(id) ?? "";
}

export function findEntry(id: string): Entry {
  return entries.find((entry) => entry.id === id) ?? entries[0];
}

export function excerpt(entry: Entry): string {
  if (entry.description.trim()) return entry.description.trim();
  const plain = entry.body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/\{[^{}\n]*\}|\{\/\}/g, "")
    .replace(/!\[[^\]]*]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1");
  const line = plain
    .split("\n")
    .map((row) => row.replace(/^[#>*\-\d.\s]+/, "").trim())
    .find(Boolean);
  return line ?? "";
}
