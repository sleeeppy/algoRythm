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
    "pass",
    "lambda",
    "with",
    "as",
    "is",
    "try",
    "except",
    "finally",
    "raise",
    "yield",
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
  const python = lang === "Python";
  const tokens: Token[] = [];
  const parens: boolean[] = [];
  let index = 0;

  while (index < line.length) {
    if (python && line[index] === "#") {
      tokens.push({ kind: "comment", text: line.slice(index) });
      break;
    }

    if (!python && line.startsWith("//", index)) {
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
      const literal = line.slice(index, end);
      tokens.push(...(python ? splitPlaceholders(literal) : [{ kind: "string" as const, text: literal }]));
      index = end;
      continue;
    }

    const previous = index > 0 ? line[index - 1] : "";
    if (/[0-9]/.test(character) && !/[A-Za-z_]/.test(previous)) {
      let end = index;
      while (end < line.length && /[0-9.]/.test(line[end])) end += 1;
      tokens.push({ kind: "number", text: line.slice(index, end) });
      index = end;
      continue;
    }

    if (/[A-Za-z_]/.test(character)) {
      let end = index;
      while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) end += 1;
      const word = line.slice(index, end);
      let kind = kindOfWord(word, line, end, keywords, python);
      if (python && kind === "text" && parens.includes(true)) kind = "function";
      tokens.push({ kind, text: word });
      index = end;
      continue;
    }

    if (character === "(") {
      const last = lastWord(tokens);
      parens.push(last?.kind === "function" || last?.kind === "type");
    } else if (character === ")") {
      parens.pop();
    }

    tokens.push({ kind: "text", text: character });
    index += 1;
  }

  return tokens;
}

function lastWord(tokens: Token[]): Token | undefined {
  for (let at = tokens.length - 1; at >= 0; at -= 1) {
    const token = tokens[at];
    if (token.text.trim() === "") continue;
    return /^[A-Za-z_]/.test(token.text) ? token : undefined;
  }
  return undefined;
}

function splitPlaceholders(literal: string): Token[] {
  const tokens: Token[] = [];
  const pattern = /\{([^{}]*)\}/g;
  let from = 0;
  for (const match of literal.matchAll(pattern)) {
    const start = match.index ?? 0;
    tokens.push({ kind: "string", text: literal.slice(from, start + 1) });
    if (match[1]) tokens.push({ kind: "keyword", text: match[1] });
    from = start + match[0].length - 1;
  }
  tokens.push({ kind: "string", text: literal.slice(from) });
  return tokens.filter((token) => token.text !== "");
}

function kindOfWord(
  word: string,
  line: string,
  end: number,
  keywords: Set<string>,
  python: boolean,
): TokenKind {
  if (python ? PYTHON_TYPES.has(word) : PRIMITIVES.has(word)) return "type";
  if (keywords.has(word)) return "keyword";
  let look = end;
  while (look < line.length && line[look] === " ") look += 1;
  if (line[look] === "(") return "function";
  if (/^[A-Z][A-Za-z0-9]*$/.test(word) && /[a-z]/.test(word)) return "type";
  return "text";
}

const PYTHON_TYPES = new Set([
  "int",
  "float",
  "str",
  "bool",
  "list",
  "dict",
  "set",
  "tuple",
  "bytes",
  "object",
  "complex",
  "frozenset",
  "type",
]);

const PRIMITIVES = new Set([
  "int",
  "long",
  "short",
  "byte",
  "float",
  "double",
  "boolean",
  "bool",
  "char",
  "void",
  "string",
  "decimal",
  "object",
  "sbyte",
  "uint",
  "ulong",
  "ushort",
  "auto",
]);
