import { parsePost } from "./markdown.ts";
export type { Entry, EntryLink, Piece, RichColor, RichSpan } from "./types.ts";
import type { Entry } from "./types.ts";

const files = import.meta.glob("../posts/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const entries: Entry[] = Object.values(files)
  .map((source) => parsePost(source as string))
  .sort((left, right) => right.stamp.localeCompare(left.stamp));

export function findEntry(id: string): Entry {
  return entries.find((entry) => entry.id === id) ?? entries[0];
}

export function excerpt(entry: Entry): string {
  if (entry.description.trim()) return entry.description.trim();
  const text = entry.pieces.find((piece) => piece.kind === "text" || piece.kind === "bullet");
  if (!text || (text.kind !== "text" && text.kind !== "bullet")) return "";
  const line = text.text.split("\n").find((row) => row.trim());
  return line?.trim() || "";
}
