import { flushSync } from "react-dom";

export type NavDir = "forward" | "back" | "fade";

export function runTransition(dir: NavDir, update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const start = document.startViewTransition?.bind(document);
  const resetScroll = dir !== "fade";
  const finish = () => {
    update();
    if (resetScroll) window.scrollTo(0, 0);
  };
  if (reduce || !start) {
    finish();
    return;
  }

  const root = document.documentElement;
  root.dataset.nav = dir;
  try {
    const transition = start(() => {
      flushSync(update);
      if (resetScroll) window.scrollTo(0, 0);
    });
    transition.finished.finally(() => {
      delete root.dataset.nav;
    });
  } catch {
    delete root.dataset.nav;
    finish();
  }
}
