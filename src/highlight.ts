export type TokenKind = "text" | "keyword" | "string" | "comment" | "number";

export type Token = {
  kind: TokenKind;
  text: string;
};

const KEYWORDS: Record<string, Set<string>> = {
  Python: new Set([
    "def",
    "return",
    "if",
    "else",
    "elif",
    "for",
    "while",
    "in",
    "import",
    "from",
    "class",
    "global",
    "and",
    "or",
    "not",
    "True",
    "False",
    "None",
    "break",
    "continue",
    "int",
  ]),
  Java: new Set([
    "class",
    "public",
    "static",
    "void",
    "int",
    "return",
    "new",
    "if",
    "else",
    "for",
    "while",
    "import",
  ]),
  "C#": new Set([
    "public",
    "static",
    "int",
    "void",
    "return",
    "if",
    "else",
    "while",
    "for",
    "using",
    "namespace",
    "class",
    "string",
  ]),
  "C++": new Set([
    "int",
    "void",
    "return",
    "if",
    "else",
    "for",
    "while",
    "using",
    "namespace",
    "class",
    "long",
    "continue",
  ]),
};

export function tokenizeLine(line: string, lang: string): Token[] {
  const keywords = KEYWORDS[lang] ?? new Set<string>();
  const tokens: Token[] = [];
  let index = 0;

  while (index < line.length) {
    if (lang === "Python" && line[index] === "#") {
      tokens.push({ kind: "comment", text: line.slice(index) });
      break;
    }

    if (lang !== "Python" && line.startsWith("//", index)) {
      tokens.push({ kind: "comment", text: line.slice(index) });
      break;
    }

    const character = line[index];

    if (character === '"' || character === "'") {
      let end = index + 1;
      while (end < line.length && line[end] !== character) {
        if (line[end] === "\\") end += 1;
        end += 1;
      }
      if (end < line.length) end += 1;
      tokens.push({ kind: "string", text: line.slice(index, end) });
      index = end;
      continue;
    }

    const previous = index > 0 ? line[index - 1] : "";
    if (/[0-9]/.test(character) && !/[A-Za-z_]/.test(previous)) {
      let end = index;
      while (end < line.length && /[0-9]/.test(line[end])) end += 1;
      tokens.push({ kind: "number", text: line.slice(index, end) });
      index = end;
      continue;
    }

    if (/[A-Za-z_]/.test(character)) {
      let end = index;
      while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) end += 1;
      const word = line.slice(index, end);
      tokens.push({
        kind: keywords.has(word) ? "keyword" : "text",
        text: word,
      });
      index = end;
      continue;
    }

    tokens.push({ kind: "text", text: character });
    index += 1;
  }

  return tokens;
}
