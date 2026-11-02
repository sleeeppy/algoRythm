import { CodeBlock } from "./CodeBlock.tsx";
import { RichText } from "./RichText.tsx";
import type { Piece } from "../types.ts";

export function Prose({ pieces }: { pieces: Piece[] }) {
  return (
    <div className="prose">
      {pieces.map((piece, index) => {
        if (piece.kind === "code") {
          return <CodeBlock key={index} lang={piece.lang} code={piece.code} />;
        }
        return (
          <p key={index} className={piece.kind === "bullet" ? "prose-bullet" : undefined}>
            <RichText text={piece.text} spans={piece.spans} />
          </p>
        );
      })}
    </div>
  );
}
