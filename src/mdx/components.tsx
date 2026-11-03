import { isValidElement, type ReactNode } from "react";
import { CodeBlock } from "../components/CodeBlock.tsx";

const COLORS = new Set(["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]);

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

type MarkProps = {
  color?: string;
  bg?: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  href?: string;
  children?: ReactNode;
};

export function Mark({ color, bg, bold, italic, strike, code, href, children }: MarkProps) {
  const background = bg ? BACKGROUNDS[bg] : "";
  const className = [
    bold ? "rt-bold" : "",
    italic ? "rt-italic" : "",
    strike ? "rt-strike" : "",
    code ? "rt-code" : "",
    color && COLORS.has(color) ? `rt-${color}` : "",
    background ? `rt-${background}` : "",
    background ? "rt-bg" : "",
    href ? "rt-link" : "",
  ]
    .filter(Boolean)
    .join(" ");
  if (href) {
    return (
      <a className={className || "rt-link"} href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return <span className={className || undefined}>{children}</span>;
}

function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

export function MdxPre({ children }: { children?: ReactNode }) {
  const element = (Array.isArray(children) ? children.find(isValidElement) : children) as
    | { props?: { className?: string } }
    | undefined;
  const className = element?.props?.className ?? "";
  const lang = className.replace(/^language-/, "").trim() || "Plain Text";
  return <CodeBlock lang={lang} code={textOf(children).replace(/\n$/, "")} />;
}

function MdxLink({ href, children }: { href?: string; children?: ReactNode }) {
  const external = Boolean(href?.startsWith("http"));
  return (
    <a className="rt-link" href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>
      {children}
    </a>
  );
}

export const mdxComponents = {
  Mark,
  pre: MdxPre,
  a: MdxLink,
};
