import { useMemo, type ReactNode } from "react";
import { evaluateSync } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "../mdx/components.tsx";
import { prepareBody } from "../mdx/prepare.ts";

const cache = new Map<string, { node: ReactNode; error: string }>();

function renderBody(source: string) {
  const prepared = prepareBody(source);
  const cached = cache.get(prepared);
  if (cached) return cached;
  try {
    const compiled = evaluateSync(prepared, {
      ...runtime,
      development: false,
      remarkPlugins: [remarkGfm, remarkBreaks],
      useMDXComponents: () => mdxComponents,
    });
    const result = { node: compiled.default({}), error: "" };
    cache.set(prepared, result);
    return result;
  } catch (error) {
    const result = {
      node: null,
      error: error instanceof Error ? error.message.split("\n")[0] : "본문을 읽지 못했습니다.",
    };
    return result;
  }
}

export function PostBody({ source }: { source: string }) {
  const rendered = useMemo(() => (source.trim() ? renderBody(source) : { node: null, error: "" }), [source]);
  if (rendered.error) return <p className="composer-message">{rendered.error}</p>;
  return <div className="prose">{rendered.node}</div>;
}
