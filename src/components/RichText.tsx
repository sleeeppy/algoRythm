import { Fragment } from "react";
import type { RichSpan } from "../data.ts";

type RichTextProps = {
  text: string;
  spans?: RichSpan[];
};

function classNameFor(span: RichSpan) {
  const colors = span.color?.split(/\s+/).filter(Boolean) ?? [];
  const names = [
    span.bold ? "rt-bold" : "",
    span.italic ? "rt-italic" : "",
    span.strike ? "rt-strike" : "",
    span.underline ? "rt-under" : "",
    span.code ? "rt-code" : "",
    ...colors.map((color) => `rt-${color}`),
    colors.some((color) => color.endsWith("_background")) ? "rt-bg" : "",
  ].filter(Boolean);
  return names.join(" ");
}

function Lines({ text }: { text: string }) {
  const parts = text.split("\n");
  return parts.map((part, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {part}
    </Fragment>
  ));
}

function renderSpan(span: RichSpan, index: number) {
  const className = classNameFor(span);
  const content = <Lines text={span.text} />;
  if (span.href) {
    return (
      <a
        key={index}
        className={className ? `rt-link ${className}` : "rt-link"}
        href={span.href}
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }
  if (!className) return <span key={index}>{content}</span>;
  return (
    <span key={index} className={className}>
      {content}
    </span>
  );
}

export function RichText({ text, spans }: RichTextProps) {
  if (!spans || spans.length === 0) return <Lines text={text} />;
  return spans.map((span, index) => {
    if (!span.code) return renderSpan(span, index);
    const match = span.text.match(/^(\n*)([\s\S]*?)(\n*)$/);
    const lead = match?.[1] ?? "";
    const body = match?.[2] ?? span.text;
    const tail = match?.[3] ?? "";
    if (!body) return <span key={index}>{span.text}</span>;
    return (
      <span key={index}>
        {lead}
        {renderSpan({ ...span, text: body }, index)}
        {tail}
      </span>
    );
  });
}
