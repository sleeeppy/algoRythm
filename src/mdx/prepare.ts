const COLORS = new Set(["gray", "brown", "orange", "yellow", "green", "blue", "purple", "pink", "red"]);

const BACKGROUNDS = new Set([
  "gray",
  "brown",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "pink",
  "red",
  "default",
]);

const STYLES = new Set(["bold", "italic", "strike", "code"]);

function styleColor(part: string) {
  const colon = part.indexOf(":");
  if (colon === -1) return "";
  const name = part.slice(0, colon);
  const color = part.slice(colon + 1);
  if (!STYLES.has(name) || !COLORS.has(color)) return "";
  return color;
}

function isSpec(spec: string) {
  const parts = spec.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0 || spec.includes("\n")) return false;
  return parts.every((part) => {
    if (STYLES.has(part) || styleColor(part)) return true;
    if (part.startsWith("link:")) return part.length > "link:".length;
    if (part.startsWith("bg:")) return BACKGROUNDS.has(part.slice(3));
    return COLORS.has(part);
  });
}

function attributes(spec: string) {
  const attrs: string[] = [];
  let color = "";
  let bg = "";
  for (const part of spec.trim().split(/\s+/).filter(Boolean)) {
    const colored = styleColor(part);
    if (STYLES.has(part)) {
      attrs.push(part);
    } else if (colored) {
      attrs.push(part.slice(0, part.indexOf(":")));
      color = colored;
    } else if (part.startsWith("link:")) {
      attrs.push(`href=${JSON.stringify(part.slice(5))}`);
    } else if (part.startsWith("bg:")) {
      bg = part.slice(3);
    } else {
      color = part;
    }
  }
  if (color) attrs.push(`color=${JSON.stringify(color)}`);
  if (bg) attrs.push(`bg=${JSON.stringify(bg)}`);
  return attrs.join(" ");
}

function skipCode(source: string, index: number) {
  if (source.startsWith("```", index)) {
    const end = source.indexOf("```", index + 3);
    return end === -1 ? source.length : end + 3;
  }
  if (source[index] === "`") {
    const end = source.indexOf("`", index + 1);
    if (end !== -1 && !source.slice(index + 1, end).includes("\n")) return end + 1;
  }
  return index;
}

function readTag(source: string, start: number) {
  const specEnd = source.indexOf("}", start + 1);
  if (specEnd === -1) return null;
  const spec = source.slice(start + 1, specEnd);
  if (!isSpec(spec)) return null;

  let index = specEnd + 1;
  let depth = 1;
  while (index < source.length) {
    const skipped = skipCode(source, index);
    if (skipped !== index) {
      index = skipped;
      continue;
    }
    if (source.startsWith("{/}", index)) {
      depth -= 1;
      if (depth === 0) {
        return { spec, inner: source.slice(specEnd + 1, index), next: index + 3 };
      }
      index += 3;
      continue;
    }
    if (source[index] === "{") {
      const nestedEnd = source.indexOf("}", index + 1);
      if (nestedEnd !== -1 && isSpec(source.slice(index + 1, nestedEnd))) {
        depth += 1;
        index = nestedEnd + 1;
        continue;
      }
    }
    index += 1;
  }
  return null;
}

function walk(source: string) {
  let out = "";
  let index = 0;
  while (index < source.length) {
    const skipped = skipCode(source, index);
    if (skipped !== index) {
      out += source.slice(index, skipped);
      index = skipped;
      continue;
    }
    if (source.startsWith("{/}", index)) {
      index += 3;
      continue;
    }
    if (source[index] === "{") {
      const tag = readTag(source, index);
      if (tag) {
        out += `<Mark ${attributes(tag.spec)}>${walk(tag.inner)}</Mark>`;
        index = tag.next;
        continue;
      }
      out += "\\{";
      index += 1;
      continue;
    }
    if (source[index] === "<") {
      const br = source.slice(index).match(/^<br\s*\/?>/i);
      if (br) {
        out += "<br />";
        index += br[0].length;
        continue;
      }
      out += "&lt;";
      index += 1;
      continue;
    }
    out += source[index];
    index += 1;
  }
  return out;
}

function keepEmphasis(source: string) {
  let out = "";
  let index = 0;
  while (index < source.length) {
    const skipped = skipCode(source, index);
    if (skipped !== index) {
      out += source.slice(index, skipped);
      index = skipped;
      continue;
    }
    if (source.startsWith("<Mark ", index) || source.startsWith("</Mark>", index)) {
      const end = source.indexOf(">", index);
      const next = end === -1 ? source.length : end + 1;
      out += source.slice(index, next);
      index = next;
      continue;
    }
    if (source.startsWith("**", index)) {
      const before = out.at(-1) ?? "";
      const after = source[index + 2] ?? "";
      const punctuation = /[\p{P}\p{S}]/u;
      if (before && punctuation.test(before) && after && !/\s/u.test(after) && !punctuation.test(after)) {
        out += "\u200b";
      }
      out += "**";
      index += 2;
      continue;
    }
    out += source[index];
    index += 1;
  }
  return out;
}

export function prepareBody(source: string) {
  return keepEmphasis(walk(source));
}
