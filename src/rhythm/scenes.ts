export type RhythmGame = "maimai" | "ongeki" | "chunithm" | "jubeat" | "soundvoltex";

export const rhythmGames: RhythmGame[] = [
  "maimai",
  "ongeki",
  "chunithm",
  "jubeat",
  "soundvoltex",
];

export const rhythmNames: Record<RhythmGame, string> = {
  maimai: "maimai",
  ongeki: "ONGEKI",
  chunithm: "CHUNITHM",
  jubeat: "jubeat",
  soundvoltex: "SOUND VOLTEX",
};

export function pickRhythmGame(): RhythmGame {
  const forced = new URLSearchParams(window.location.search).get("game");
  const match = rhythmGames.find((game) => game === forced);
  if (match) return match;
  return rhythmGames[Math.floor(Math.random() * rhythmGames.length)];
}

export type Tone =
  | "ink"
  | "pink"
  | "blue"
  | "yellow"
  | "purple"
  | "green"
  | "red"
  | "orange";

export type ScenePoint = {
  x: number;
  y: number;
  alpha?: number;
  scale?: number;
};

export type Spot = {
  at: (time: number) => ScenePoint;
  tone: Tone;
  size: number;
  alpha: number;
};

type Projection = (u: number, v: number) => ScenePoint & { scale: number };

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

function cycle(time: number, period: number, offset: number) {
  return (((time / period + offset) % 1) + 1) % 1;
}

function fadeEdges(progress: number, edge = 0.12) {
  return Math.max(0, Math.min(1, progress / edge, (1 - progress) / edge));
}

function still(x: number, y: number, seed: number): Spot["at"] {
  return (time) => ({
    x: x + Math.sin(time * 0.0007 + seed) * 0.0025,
    y: y + Math.cos(time * 0.0006 + seed) * 0.0025,
  });
}

function line(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  count: number,
  tone: Tone,
  size: number,
  alpha: number,
): Spot[] {
  return Array.from({ length: count }, (_, index) => {
    const amount = count === 1 ? 0.5 : index / (count - 1);
    return {
      at: still(lerp(x1, x2, amount), lerp(y1, y2, amount), index * 1.7 + x1 * 11),
      tone,
      size,
      alpha,
    };
  });
}

function ring(
  radius: number,
  count: number,
  tone: Tone,
  size: number,
  alpha: number,
): Spot[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return {
      at: still(Math.cos(angle) * radius, Math.sin(angle) * radius, index * 0.9),
      tone,
      size,
      alpha,
    };
  });
}

function perspective(
  topHalf: number,
  bottomHalf: number,
  top: number,
  bottom: number,
): Projection {
  return (u, v) => ({
    x: u * lerp(topHalf, bottomHalf, v),
    y: lerp(top, bottom, v),
    scale: lerp(0.55, 1, v),
  });
}

function rail(
  project: Projection,
  u: number,
  count: number,
  tone: Tone,
  size: number,
  alpha: number,
): Spot[] {
  return Array.from({ length: count }, (_, index) => {
    const point = project(u, index / (count - 1));
    return {
      at: still(point.x, point.y, index * 1.3 + u * 7),
      tone,
      size: size * point.scale,
      alpha,
    };
  });
}

type FallingNote = {
  from: number;
  to: number;
  stars: number;
  period: number;
  offset: number;
  tone: Tone;
  size?: number;
};

function falling(project: Projection, note: FallingNote, curve = 1.35): Spot[] {
  return Array.from({ length: note.stars }, (_, index) => ({
    tone: note.tone,
    size: note.size ?? 1,
    alpha: 1,
    at: (time) => {
      const progress = cycle(time, note.period, note.offset);
      const u = lerp(note.from, note.to, note.stars === 1 ? 0.5 : index / (note.stars - 1));
      const point = project(u, progress ** curve);
      return { ...point, alpha: fadeEdges(progress) };
    },
  }));
}

function maimai(): Spot[] {
  const spots: Spot[] = [...ring(0.88, 120, "ink", 0.85, 0.5), ...ring(0.13, 14, "ink", 0.7, 0.28)];
  const buttons = Array.from(
    { length: 8 },
    (_, index) => -Math.PI / 2 + Math.PI / 8 + (index * Math.PI) / 4,
  );

  buttons.forEach((angle, button) => {
    for (let side = -1; side <= 1; side += 1) {
      const spread = angle + side * 0.04;
      spots.push({
        at: still(Math.cos(spread) * 1.0, Math.sin(spread) * 1.0, button * 3 + side),
        tone: "yellow",
        size: 1.2,
        alpha: 0.9,
      });
    }
  });

  const taps = [
    { button: 0, offset: 0, tone: "pink" as Tone },
    { button: 3, offset: 0.34, tone: "pink" as Tone },
    { button: 6, offset: 0.67, tone: "orange" as Tone },
  ];
  taps.forEach((tap) => {
    const angle = buttons[tap.button];
    for (let star = 0; star < 8; star += 1) {
      const around = (star / 8) * Math.PI * 2;
      spots.push({
        tone: tap.tone,
        size: 0.95,
        alpha: 1,
        at: (time) => {
          const progress = cycle(time, 4800, tap.offset);
          const distance = lerp(0.14, 0.88, progress);
          const size = 0.055 * lerp(0.45, 1, progress);
          return {
            x: Math.cos(angle) * distance + Math.cos(around) * size,
            y: Math.sin(angle) * distance + Math.sin(around) * size,
            alpha: fadeEdges(progress, 0.1),
          };
        },
      });
    }
  });

  const start = buttons[1];
  const end = buttons[4];
  const sx = Math.cos(start) * 0.88;
  const sy = Math.sin(start) * 0.88;
  const ex = Math.cos(end) * 0.88;
  const ey = Math.sin(end) * 0.88;
  spots.push(...line(sx, sy, ex, ey, 18, "blue", 0.75, 0.45));
  spots.push({
    tone: "blue",
    size: 1.9,
    alpha: 1,
    at: (time) => {
      const progress = cycle(time, 5600, 0.2);
      return {
        x: lerp(sx, ex, progress),
        y: lerp(sy, ey, progress),
        alpha: fadeEdges(progress, 0.08),
      };
    },
  });

  return spots;
}

function ongeki(): Spot[] {
  const project = perspective(0.2, 0.78, -0.92, 0.7);
  const spots: Spot[] = [
    ...rail(project, -1.12, 22, "pink", 1, 0.85),
    ...rail(project, 1.12, 22, "purple", 1, 0.85),
    ...[-1, -1 / 3, 1 / 3, 1].flatMap((u) => rail(project, u, 20, "ink", 0.75, 0.22)),
  ];

  const lanes: Array<{ center: number; tone: Tone }> = [
    { center: -2 / 3, tone: "red" },
    { center: 0, tone: "green" },
    { center: 2 / 3, tone: "blue" },
  ];
  lanes.forEach((lane, index) => {
    spots.push(...line(lane.center * 0.78 - 0.06, 0.86, lane.center * 0.78 + 0.06, 0.86, 4, lane.tone, 1.15, 0.9));
    spots.push(
      ...falling(project, {
        from: lane.center - 0.25,
        to: lane.center + 0.25,
        stars: 4,
        period: 4600,
        offset: index * 0.31,
        tone: lane.tone,
      }),
    );
  });

  [
    { x: 0, y: -0.04 },
    { x: -0.035, y: 0.03 },
    { x: 0.035, y: 0.03 },
  ].forEach((corner) => {
    spots.push({
      tone: "ink",
      size: 1,
      alpha: 0.9,
      at: (time) => {
        const point = project(Math.sin(time * 0.0005) * 0.45, 0.93);
        return { x: point.x + corner.x, y: point.y + corner.y };
      },
    });
  });

  [0.15, 0.6].forEach((offset, index) => {
    spots.push({
      tone: "pink",
      size: 0.8,
      alpha: 0.9,
      at: (time) => {
        const progress = cycle(time, 5200, offset);
        const point = project(index === 0 ? -0.8 + progress : 0.8 - progress, progress ** 1.3);
        return { ...point, alpha: fadeEdges(progress) };
      },
    });
  });

  return spots;
}

function chunithm(): Spot[] {
  const project = perspective(0.52, 0.98, -0.55, 0.62);
  const spots: Spot[] = [
    ...rail(project, -1, 20, "ink", 0.85, 0.5),
    ...rail(project, 1, 20, "ink", 0.85, 0.5),
    ...[-0.5, 0, 0.5].flatMap((u) => rail(project, u, 18, "ink", 0.7, 0.16)),
    ...line(-0.98, 0.62, 0.98, 0.62, 30, "red", 0.95, 0.9),
    ...line(-0.98, 0.8, 0.98, 0.8, 16, "ink", 1.1, 0.55),
  ];

  spots.push(
    ...falling(project, { from: -1, to: -0.5, stars: 6, period: 5000, offset: 0, tone: "red" }, 1.2),
    ...falling(project, { from: 0.25, to: 0.75, stars: 6, period: 5000, offset: 0.4, tone: "red" }, 1.2),
    ...falling(project, { from: -0.25, to: 0.25, stars: 6, period: 5000, offset: 0.72, tone: "yellow" }, 1.2),
  );

  for (let star = 0; star < 24; star += 1) {
    const step = Math.floor(star / 2);
    const side = star % 2 === 0 ? -0.14 : 0.14;
    spots.push({
      tone: "blue",
      size: 0.9,
      alpha: 0.95,
      at: (time) => {
        const progress = cycle(time, 6200, 0.15);
        const v = Math.max(0, progress ** 1.2 - step * 0.035);
        const point = project(lerp(-0.6, 0.4, v) + side, v);
        return { ...point, alpha: fadeEdges(progress) * (v <= 0 ? 0 : 1) };
      },
    });
  }

  [
    { x: -0.45, offset: 0.1 },
    { x: 0.55, offset: 0.6 },
  ].forEach((arrow) => {
    for (let star = -2; star <= 2; star += 1) {
      spots.push({
        tone: "green",
        size: 1,
        alpha: 1,
        at: (time) => {
          const progress = cycle(time, 3600, arrow.offset);
          return {
            x: arrow.x + star * 0.035,
            y: lerp(0.5, 0.12, progress) + Math.abs(star) * 0.035,
            alpha: fadeEdges(progress, 0.2),
          };
        },
      });
    }
  });

  return spots;
}

function squareOutline(cx: number, cy: number, half: number, perSide: number) {
  const points: Array<{ x: number; y: number }> = [];
  const corners = [
    [cx - half, cy - half],
    [cx + half, cy - half],
    [cx + half, cy + half],
    [cx - half, cy + half],
  ];
  corners.forEach((corner, index) => {
    const next = corners[(index + 1) % 4];
    for (let step = 0; step < perSide; step += 1) {
      points.push({
        x: lerp(corner[0], next[0], step / perSide),
        y: lerp(corner[1], next[1], step / perSide),
      });
    }
  });
  return points;
}

function jubeat(): Spot[] {
  const panel = 0.34;
  const gap = 0.17;
  const start = -0.935;
  const centerOf = (cell: number) => ({
    x: start + panel / 2 + (cell % 4) * (panel + gap),
    y: start + panel / 2 + Math.floor(cell / 4) * (panel + gap),
  });

  const spots: Spot[] = [];
  for (let cell = 0; cell < 16; cell += 1) {
    const center = centerOf(cell);
    squareOutline(center.x, center.y, panel / 2, 4).forEach((point, index) => {
      spots.push({ at: still(point.x, point.y, cell * 5 + index), tone: "ink", size: 0.8, alpha: 0.32 });
    });
  }

  const markers: Array<{ offset: number; tone: Tone }> = [
    { offset: 0, tone: "orange" },
    { offset: 0.5, tone: "blue" },
  ];
  markers.forEach((marker, markerIndex) => {
    [
      { reach: 0.92, delay: 0, perSide: 3 },
      { reach: 0.5, delay: 0.12, perSide: 2 },
    ].forEach((layer) => {
      squareOutline(0, 0, 1, layer.perSide).forEach((unit) => {
        spots.push({
          tone: marker.tone,
          size: 1,
          alpha: 1,
          at: (time) => {
            const raw = time / 2600 + marker.offset;
            const round = Math.floor(raw);
            const progress = raw - round;
            const cell = (round * 5 + markerIndex * 9 + 3) % 16;
            const center = centerOf(cell);
            const grow = Math.max(0, Math.min(1, (progress - layer.delay) / 0.6));
            const half = (panel / 2) * lerp(0.15, layer.reach, 1 - (1 - grow) ** 3);
            return {
              x: center.x + unit.x * half,
              y: center.y + unit.y * half,
              alpha: fadeEdges(progress, 0.12) * (grow > 0 ? 1 : 0),
            };
          },
        });
      });
    });
  });

  return spots;
}

function triangle(value: number) {
  const wrapped = ((value % 1) + 1) % 1;
  return 1 - Math.abs(wrapped * 2 - 1);
}

function soundvoltex(): Spot[] {
  const project = perspective(0.14, 0.52, -0.95, 0.7);
  const spots: Spot[] = [
    ...rail(project, -1, 24, "ink", 0.85, 0.55),
    ...rail(project, 1, 24, "ink", 0.85, 0.55),
    ...[-0.5, 0, 0.5].flatMap((u) => rail(project, u, 22, "ink", 0.7, 0.18)),
    ...line(-0.72, 0.7, 0.72, 0.7, 28, "ink", 1, 0.85),
  ];

  [
    { x: -0.82, tone: "blue" as Tone },
    { x: 0.82, tone: "pink" as Tone },
  ].forEach((knob) => {
    for (let star = 0; star < 6; star += 1) {
      const angle = (star / 6) * Math.PI * 2;
      spots.push({
        at: still(knob.x + Math.cos(angle) * 0.05, 0.7 + Math.sin(angle) * 0.05, star + knob.x * 9),
        tone: knob.tone,
        size: 0.9,
        alpha: 0.95,
      });
    }
  });

  [
    { tone: "blue" as Tone, base: -1, sign: 1, shift: 0 },
    { tone: "pink" as Tone, base: 1, sign: -1, shift: 0.5 },
  ].forEach((laser) => {
    for (let star = 0; star < 26; star += 1) {
      const v = 0.02 + (star / 25) * 0.98;
      spots.push({
        tone: laser.tone,
        size: 1,
        alpha: 0.85,
        at: (time) => {
          const scroll = v - time / 9000;
          const u = laser.base + laser.sign * 1.3 * triangle(scroll * 1.2 + laser.shift);
          return project(u, v);
        },
      });
    }
  });

  [
    { lane: 0, offset: 0 },
    { lane: 2, offset: 0.33 },
    { lane: 3, offset: 0.66 },
  ].forEach((note) => {
    const center = -0.75 + note.lane * 0.5;
    spots.push(
      ...falling(project, {
        from: center - 0.18,
        to: center + 0.18,
        stars: 3,
        period: 3800,
        offset: note.offset,
        tone: "ink",
      }, 1.4),
    );
  });
  spots.push(
    ...falling(project, { from: -0.95, to: -0.05, stars: 6, period: 3800, offset: 0.5, tone: "orange" }, 1.4),
  );

  return spots;
}

const scenes: Record<RhythmGame, () => Spot[]> = {
  maimai,
  ongeki,
  chunithm,
  jubeat,
  soundvoltex,
};

export function buildScene(game: RhythmGame): Spot[] {
  return scenes[game]();
}
