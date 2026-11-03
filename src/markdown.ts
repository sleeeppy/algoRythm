import type { Entry, EntryLink } from "./types.ts";

function quote(value: string) {
  return JSON.stringify(value);
}

export function toMarkdown(entry: Omit<Entry, "id">): string {
  const lines = [
    "---",
    `stamp: ${quote(entry.stamp)}`,
    `problem: ${quote(entry.problem)}`,
    `lang: ${quote(entry.lang)}`,
    `description: ${quote(entry.description)}`,
  ];
  if (entry.links.length > 0) {
    lines.push("links:");
    for (const link of entry.links) {
      lines.push(`  - href: ${quote(link.href)}`);
      lines.push(`    label: ${quote(link.label)}`);
    }
  }
  const body = entry.body.replace(/^\n+/, "").trimEnd();
  lines.push("---", "", body, "");
  return lines.join("\n");
}

export function composePost(input: {
  stamp: string;
  problem: string;
  lang: string;
  description: string;
  links: EntryLink[];
  body: string;
}) {
  return toMarkdown(input);
}

function unquote(value: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return JSON.parse(trimmed) as string;
  }
  return trimmed;
}

function parseFrontmatter(block: string) {
  const entry: {
    stamp: string;
    problem: string;
    lang: string;
    links: EntryLink[];
    description: string;
  } = { stamp: "", problem: "", lang: "", links: [], description: "" };
  let link: EntryLink | null = null;
  for (const line of block.split("\n")) {
    if (line.startsWith("  - href:")) {
      if (link?.href) entry.links.push(link);
      link = { href: unquote(line.slice("  - href:".length)), label: "" };
      continue;
    }
    if (line.startsWith("    label:") && link) {
      link.label = unquote(line.slice("    label:".length));
      continue;
    }
    const split = line.indexOf(":");
    if (split === -1) continue;
    const key = line.slice(0, split).trim();
    const value = unquote(line.slice(split + 1));
    if (key === "stamp") entry.stamp = value;
    if (key === "problem") entry.problem = value;
    if (key === "lang") entry.lang = value;
    if (key === "description") entry.description = value;
  }
  if (link?.href) entry.links.push(link);
  return entry;
}

export function readPost(source: string) {
  const matched = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = parseFrontmatter(matched?.[1] ?? "");
  const body = (matched ? source.slice(matched[0].length) : source).replace(/^\n/, "");
  return { ...meta, body };
}

export function parsePost(source: string): Entry {
  const post = readPost(source);
  if (!/^\d{8}$/.test(post.stamp)) throw new Error("날짜는 20261101 형식이어야 합니다.");
  if (!post.problem.trim()) throw new Error("제목을 적어 주세요.");
  if (!post.lang.trim()) throw new Error("언어를 적어 주세요.");
  return {
    id: post.stamp,
    stamp: post.stamp,
    problem: post.problem,
    lang: post.lang,
    description: post.description,
    links: post.links,
    body: post.body,
  };
}
