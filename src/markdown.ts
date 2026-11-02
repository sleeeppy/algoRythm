import type { Entry, EntryLink, Piece, RichSpan } from "./types.ts";

const FOREGROUND = new Set([
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
]);

const BACKGROUNDS: Record<string, string> = {
  gray: "gray_background",
  brown: "brown_background",
  orange: "orange_background",
  yellow: "yellow_background",
  green: "green_background",
  blue: "blue_background",
  purple: "purple_background",
  pink: "pink_background",
  red: "red_background",
  default: "default_background",
};

function quote(value: string) {
  return JSON.stringify(value);
}

function marks(span: RichSpan) {
  return Boolean(span.bold || span.italic || span.strike || span.underline || span.code || span.color || span.href);
}

function wrapSpan(span: RichSpan, text: string) {
  if (!text) return "";
  let inner = text;
  if (span.code) inner = `\`${text}\``;
  else if (span.bold) inner = `**${text}**`;
  else if (span.italic) inner = `*${text}*`;
  else if (span.strike) inner = `~~${text}~~`;

  if (span.href && /[[\]()]/.test(text)) {
    inner = `{link:${span.href}}${inner}{/}`;
  } else if (span.href) {
    inner = `[${inner}](${span.href})`;
  }
  if (!span.color) return inner;

  const tags = span.color.split(/\s+/).flatMap((name) => {
    if (name.endsWith("_background")) {
      const key = name.replace(/_background$/, "");
      return [`bg:${key}`];
    }
    return [name];
  });
  return `{${tags.join(" ")}}${inner}{/}`;
}

function spanToMarkdown(span: RichSpan): string {
  return span.text
    .split(/(\n{2,})/)
    .map((part) => (/^\n{2,}$/.test(part) ? part : wrapSpan({ ...span, text: part }, part)))
    .join("");
}

function pieceToMarkdown(piece: Piece) {
  if (piece.kind === "code") {
    return `\`\`\`${piece.lang}\n${piece.code}\n\`\`\``;
  }
  const body = piece.spans?.length ? piece.spans.map(spanToMarkdown).join("") : piece.text;
  return piece.kind === "bullet" ? `- ${body}` : body;
}

export function toMarkdown(entry: Entry): string {
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
  lines.push("---", "", entry.pieces.map(pieceToMarkdown).join("\n\n"), "");
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
  const front = toMarkdown({
    id: input.stamp,
    stamp: input.stamp,
    problem: input.problem,
    lang: input.lang,
    description: input.description,
    links: input.links,
    pieces: [],
  }).trimEnd();
  const body = input.body.replace(/^\n+/, "").trimEnd();
  return `${front}\n\n${body}\n`;
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

function flagsFromSpec(spec: string): RichSpan {
  const span: RichSpan = { text: "" };
  const colors: string[] = [];
  for (const part of spec.split(/\s+/).filter(Boolean)) {
    if (part === "bold") span.bold = true;
    else if (part === "italic") span.italic = true;
    else if (part === "strike") span.strike = true;
    else if (part === "code") span.code = true;
    else if (part.startsWith("link:")) span.href = part.slice(5);
    else if (part.startsWith("bg:")) {
      const name = BACKGROUNDS[part.slice(3)];
      if (name) colors.push(name);
    } else if (FOREGROUND.has(part)) colors.push(part);
  }
  if (colors.length > 0) span.color = colors.join(" ");
  return span;
}

function mergeSpan(base: RichSpan, span: RichSpan): RichSpan {
  const colors = [base.color, span.color].filter(Boolean).join(" ");
  return {
    text: span.text,
    bold: span.bold || base.bold,
    italic: span.italic || base.italic,
    strike: span.strike || base.strike,
    underline: span.underline || base.underline,
    code: span.code || base.code,
    href: span.href || base.href,
    ...(colors ? { color: colors } : {}),
  };
}

export function parseInline(input: string): RichSpan[] {
  const spans: RichSpan[] = [];
  let buffer = "";
  let index = 0;

  const flush = () => {
    if (!buffer) return;
    spans.push({ text: buffer });
    buffer = "";
  };

  while (index < input.length) {
    if (input.startsWith("**", index)) {
      const end = input.indexOf("**", index + 2);
      if (end !== -1) {
        flush();
        spans.push({ text: input.slice(index + 2, end), bold: true });
        index = end + 2;
        continue;
      }
    }

    if (input.startsWith("~~", index)) {
      const end = input.indexOf("~~", index + 2);
      if (end !== -1) {
        flush();
        spans.push({ text: input.slice(index + 2, end), strike: true });
        index = end + 2;
        continue;
      }
    }

    if (input[index] === "`") {
      const end = input.indexOf("`", index + 1);
      if (end !== -1) {
        flush();
        spans.push({ text: input.slice(index + 1, end), code: true });
        index = end + 1;
        continue;
      }
    }

    if (input[index] === "[") {
      const match = input.slice(index).match(/^\[([^\]]+)\]\(([^)\s]+)\)/);
      if (match) {
        flush();
        spans.push({ text: match[1], href: match[2] });
        index += match[0].length;
        continue;
      }
    }

    if (input[index] === "*" && input[index + 1] !== "*") {
      const end = input.indexOf("*", index + 1);
      if (end !== -1 && !input.slice(index + 1, end).includes("\n")) {
        flush();
        spans.push({ text: input.slice(index + 1, end), italic: true });
        index = end + 1;
        continue;
      }
    }

    if (input[index] === "{") {
      const close = input.indexOf("}", index);
      const endTag = close === -1 ? -1 : input.indexOf("{/}", close);
      if (close !== -1 && endTag !== -1) {
        flush();
        const base = flagsFromSpec(input.slice(index + 1, close));
        for (const span of parseInline(input.slice(close + 1, endTag))) {
          spans.push(mergeSpan(base, span));
        }
        index = endTag + 3;
        continue;
      }
    }

    buffer += input[index];
    index += 1;
  }

  flush();
  return spans;
}

function withSpans(text: string): { text: string; spans?: RichSpan[] } {
  const spans = parseInline(text);
  const plain = spans.map((span) => span.text).join("");
  return spans.some(marks) ? { text: plain, spans } : { text: plain };
}

function textPieces(section: string): Piece[] {
  const trimmed = section.replace(/^\n+|\n+$/g, "");
  if (!trimmed.trim()) return [];
  return trimmed.split(/\n{2,}/).flatMap((block): Piece[] => {
    const lines = block.split("\n");
    if (lines.every((line) => line.startsWith("- "))) {
      return lines.map((line) => ({
        kind: "bullet" as const,
        ...withSpans(line.slice(2)),
      }));
    }
    return [{ kind: "text" as const, ...withSpans(block) }];
  });
}

export function parseBody(body: string): Piece[] {
  const pieces: Piece[] = [];
  const pattern = /```([^\n`]*)\n([\s\S]*?)```/g;
  let last = 0;
  for (const match of body.matchAll(pattern)) {
    pieces.push(...textPieces(body.slice(last, match.index ?? 0)));
    pieces.push({
      kind: "code",
      lang: match[1].trim() || "Plain Text",
      code: match[2].replace(/\n$/, ""),
    });
    last = (match.index ?? 0) + match[0].length;
  }
  pieces.push(...textPieces(body.slice(last)));
  return pieces;
}

export function parsePost(source: string): Entry {
  const matched = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = parseFrontmatter(matched?.[1] ?? "");
  const body = matched ? source.slice(matched[0].length) : source;
  if (!/^\d{8}$/.test(meta.stamp)) throw new Error("날짜는 20261101 형식이어야 합니다.");
  if (!meta.problem.trim()) throw new Error("제목을 적어 주세요.");
  if (!meta.lang.trim()) throw new Error("언어를 적어 주세요.");
  return {
    id: meta.stamp,
    stamp: meta.stamp,
    problem: meta.problem,
    lang: meta.lang,
    description: meta.description,
    links: meta.links,
    pieces: parseBody(body),
  };
}

export function readPost(source: string) {
  const matched = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = parseFrontmatter(matched?.[1] ?? "");
  const body = (matched ? source.slice(matched[0].length) : source).replace(/^\n/, "");
  return { ...meta, body };
}
