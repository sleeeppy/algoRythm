import { flushSync } from "react-dom";

export type NavDir = "forward" | "back" | "fade";

export function runTransition(dir: NavDir, update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = document.startViewTransition?.bind(document);
  if (reduce || !start) {
    update();
    window.scrollTo(0, 0);
    return;
  }

  const root = document.documentElement;
  root.dataset.nav = dir;
  try {
    const transition = start(() => {
      flushSync(update);
      window.scrollTo(0, 0);
    });
    transition.finished.finally(() => {
      delete root.dataset.nav;
    });
  } catch {
    delete root.dataset.nav;
    update();
    window.scrollTo(0, 0);
  }
}
