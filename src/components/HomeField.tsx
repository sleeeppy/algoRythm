import { useEffect, useRef, useState } from "react";
import { buildScene, type RhythmGame, type Tone } from "../rhythm/scenes.ts";

const FONT = '600 {size}px ui-monospace, "SF Mono", Menlo, monospace';

const lightTones: Record<Tone, string> = {
  ink: "#1a1a1a",
  pink: "#e83e7c",
  blue: "#1d8fe0",
  yellow: "#d99a00",
  purple: "#8f55ea",
  green: "#1fa866",
  red: "#e04646",
  orange: "#ec7612",
};

const darkTones: Record<Tone, string> = {
  ink: "#f3f3f1",
  pink: "#ff5c97",
  blue: "#4cbcff",
  yellow: "#ffcf4a",
  purple: "#bf8bff",
  green: "#4fe0a0",
  red: "#ff6b6b",
  orange: "#ffa24d",
};

type Body = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
};

type HomeFieldProps = {
  game: RhythmGame;
  label: string;
};

export function HomeField({ game, label }: HomeFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const spots = buildScene(game);
    const bodies: Body[] = spots.map(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      targetX: Number.NaN,
      targetY: Number.NaN,
    }));

    let width = 1;
    let height = 1;
    let centerX = 0;
    let centerY = 0;
    let half = 1;
    let mouseX = -9999;
    let mouseY = -9999;
    let frame = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const narrow = width < 860;
      const scale = 0.8;
      if (narrow) {
        half = (Math.min(width * 0.86, height * 0.46) * scale) / 2;
        centerX = width / 2;
        centerY = height * 0.32;
      } else {
        half = (Math.min(width * 0.56, height * 0.8) * scale) / 2;
        centerX = (width - 360) / 2;
        centerY = height * 0.52;
      }
      setAnchor({ x: centerX + half, y: centerY + half });
    };

    const draw = (time: number) => {
      const now = reduce ? 2400 : time;
      const tones = document.documentElement.dataset.theme === "dark" ? darkTones : lightTones;
      const unit = half / 28;
      context.clearRect(0, 0, width, height);
      context.textAlign = "center";
      context.textBaseline = "middle";

      spots.forEach((spot, index) => {
        const point = spot.at(now);
        const body = bodies[index];
        const targetX = centerX + point.x * half;
        const targetY = centerY + point.y * half;
        const jumped =
          !Number.isFinite(body.targetX) ||
          Math.hypot(targetX - body.targetX, targetY - body.targetY) > half * 0.25;
        body.targetX = targetX;
        body.targetY = targetY;

        if (reduce || jumped) {
          body.x = targetX;
          body.y = targetY;
          body.vx = 0;
          body.vy = 0;
        } else {
          let ax = (targetX - body.x) * 0.08;
          let ay = (targetY - body.y) * 0.08;
          const dx = body.x - mouseX;
          const dy = body.y - mouseY;
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < 120) {
            const push = (1 - distance / 120) ** 2 * 18;
            ax += (dx / distance) * push;
            ay += (dy / distance) * push;
          }
          body.vx = (body.vx + ax) * 0.78;
          body.vy = (body.vy + ay) * 0.78;
          body.x += body.vx;
          body.y += body.vy;
        }

        const alpha = spot.alpha * (point.alpha ?? 1);
        if (alpha < 0.02) return;
        const size = Math.max(8, Math.round(unit * spot.size * (point.scale ?? 1)));
        context.globalAlpha = alpha;
        context.fillStyle = tones[spot.tone];
        context.font = FONT.replace("{size}", String(size));
        context.fillText("*", body.x, body.y + size * 0.28);
      });

      context.globalAlpha = 1;
    };

    const tick = (time: number) => {
      if (!running) return;
      draw(time);
      frame = requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = event.clientX - rect.left;
      mouseY = event.clientY - rect.top;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    resize();
    if (reduce) draw(0);
    else frame = requestAnimationFrame(tick);
    if (fine && !reduce) {
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", resize);

    return () => {
      running = false;
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [game]);

  return (
    <>
      <canvas ref={canvasRef} className="home-canvas" aria-hidden="true" />
      {anchor ? (
        <p className="home-game" style={{ left: anchor.x, top: anchor.y }}>
          {label}
        </p>
      ) : null}
    </>
  );
}
