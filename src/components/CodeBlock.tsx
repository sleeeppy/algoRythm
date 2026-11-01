import { tokenizeLine } from "../highlight.ts";

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
            {tokenizeLine(line, lang).map((token, tokenIndex) =>
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
