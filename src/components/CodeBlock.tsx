import { useEffect, useRef, useState } from "react";
import { tokenizeLine, type Token } from "../highlight.ts";

type CodeBlockProps = {
  lang: string;
  code: string;
};

export function CodeBlock({ lang, code }: CodeBlockProps) {
  const lines = code.split("\n");
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="code-frame">
      <button
        type="button"
        className={copied ? "code-copy press is-copied" : "code-copy press"}
        onClick={copy}
        aria-label={copied ? "복사됨" : "코드 복사"}
      >
        <span className="code-copy-glyph is-copy">
          <CopyIcon />
        </span>
        <span className="code-copy-glyph is-check">
          <CheckIcon />
        </span>
      </button>
      <pre className="code-block">
        <code>
        {lines.map((line, lineIndex) => (
          <span className="code-line" key={`${lineIndex}-${line}`}>
            {groupTokens(tokenizeLine(line, lang)).map((token, tokenIndex) =>
              token.kind === "text" ? (
                <span key={tokenIndex}>{token.text}</span>
              ) : (
                <span key={tokenIndex} className={`tok-${token.kind}`}>
                  {token.text}
                </span>
              ),
            )}
            {lineIndex < lines.length - 1 ? "\n" : null}
          </span>
        ))}
        </code>
      </pre>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect x="5.25" y="5.25" width="8.2" height="8.2" rx="1.6" />
      <path d="M10.7 5.2V3.7a1.55 1.55 0 0 0-1.55-1.55H3.7A1.55 1.55 0 0 0 2.15 3.7v5.45A1.55 1.55 0 0 0 3.7 10.7H5.2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path pathLength="1" d="M3.4 8.3l3 3 6.2-6.6" />
    </svg>
  );
}

function groupTokens(tokens: Token[]): Token[] {
  const groups: Token[] = [];
  for (const token of tokens) {
    const last = groups.at(-1);
    if (last && last.kind === token.kind) last.text += token.text;
    else groups.push({ kind: token.kind, text: token.text });
  }
  return groups;
}
