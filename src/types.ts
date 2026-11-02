export type RichColor =
  | "gray"
  | "brown"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple"
  | "pink"
  | "red"
  | "gray_background"
  | "brown_background"
  | "orange_background"
  | "yellow_background"
  | "green_background"
  | "blue_background"
  | "purple_background"
  | "pink_background"
  | "red_background"
  | "default_background";

export type RichSpan = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  underline?: boolean;
  code?: boolean;
  color?: string;
  href?: string;
};

export type Piece =
  | { kind: "text"; text: string; spans?: RichSpan[] }
  | { kind: "bullet"; text: string; spans?: RichSpan[] }
  | { kind: "code"; lang: string; code: string };

export type EntryLink = {
  href: string;
  label: string;
};

export type Entry = {
  id: string;
  stamp: string;
  problem: string;
  lang: string;
  links: EntryLink[];
  pieces: Piece[];
};
