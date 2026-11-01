import { useEffect, useRef } from "react";

type ProgressBarProps = {
  watch: string;
};

export function ProgressBar({ watch }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    const fill = fillRef.current;
    if (!bar || !fill) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const article = document.querySelector("[data-article]");
      if (!article) {
        bar.hidden = true;
        return;
      }
      const rect = article.getBoundingClientRect();
      const room = article.scrollHeight - window.innerHeight;
      if (room < 240) {
        bar.hidden = true;
        return;
      }
      const reading = rect.top < 96;
      bar.hidden = !reading;
      const max = Math.max(room, 1);
      const scrolled = Math.max(0, -rect.top);
      const progress = Math.min(1, scrolled / max);
      fill.style.transform = `scaleX(${progress})`;
      bar.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [watch]);

  return (
    <div
      ref={barRef}
      className="progress"
      role="progressbar"
      aria-label="읽은 위치"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
      hidden
    >
      <div ref={fillRef} className="progress-fill" />
    </div>
  );
}
