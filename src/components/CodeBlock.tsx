import { tokenizeLine, type Token } from "../highlight.ts";

type CodeBlockProps = {
  lang: string;
  code: string;
};

export function CodeBlock({ lang, code }: CodeBlockProps) {
  const lines = code.split("\n");

  return (
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
