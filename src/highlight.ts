export type TokenKind = "text" | "keyword" | "string" | "comment" | "number" | "type" | "function";

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
    "abstract",
    "boolean",
    "break",
    "case",
    "catch",
    "class",
    "continue",
    "double",
    "else",
    "enum",
    "extends",
    "false",
    "final",
    "finally",
    "float",
    "for",
    "if",
    "implements",
    "import",
    "instanceof",
    "int",
    "interface",
    "long",
    "new",
    "null",
    "package",
    "private",
    "protected",
    "public",
    "return",
    "static",
    "super",
    "switch",
    "this",
    "throw",
    "throws",
    "true",
    "try",
    "void",
    "while",
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
    "new",
    "var",
    "foreach",
    "in",
    "null",
    "true",
    "false",
    "bool",
    "const",
    "private",
    "this",
    "switch",
    "case",
    "break",
    "continue",
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
      tokens.push({ kind: kindOfWord(word, line, end, keywords), text: word });
      index = end;
      continue;
    }

    tokens.push({ kind: "text", text: character });
    index += 1;
  }

  return tokens;
}

function kindOfWord(word: string, line: string, end: number, keywords: Set<string>): TokenKind {
  if (keywords.has(word)) return "keyword";
  let look = end;
  while (look < line.length && line[look] === " ") look += 1;
  if (line[look] === "(") return "function";
  if (/^[A-Z][A-Za-z0-9]*$/.test(word) && /[a-z]/.test(word)) return "type";
  return "text";
}
