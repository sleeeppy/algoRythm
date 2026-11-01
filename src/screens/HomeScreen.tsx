import { useEffect, useState } from "react";
import { HomeField } from "../components/HomeField.tsx";
import { pickRhythmGame, rhythmNames } from "../rhythm/scenes.ts";

type HomeScreenProps = {
  onOpenLog: () => void;
};

export function HomeScreen({ onOpenLog }: HomeScreenProps) {
  const [game] = useState(pickRhythmGame);

  useEffect(() => {
    document.title = "AlgoRythm";
  }, []);

  useEffect(() => {
    let armed = true;
    let acc = 0;
    let resetTimer = 0;
    const go = () => {
      if (!armed) return;
      armed = false;
      onOpenLog();
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      if (event.deltaY <= 0) {
        acc = 0;
        return;
      }
      acc += event.deltaY;
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        acc = 0;
      }, 180);
      if (acc < 64) return;
      event.preventDefault();
      go();
    };
    const onScroll = () => {
      if (window.scrollY > 12) go();
    };
    let startY = 0;
    const onTouchStart = (event: TouchEvent) => {
      startY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? startY;
      if (startY - y < 56) return;
      event.preventDefault();
      go();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      armed = false;
      window.clearTimeout(resetTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [onOpenLog]);

  return (
    <main className="home">
      <HomeField game={game} label={rhythmNames[game]} />
      <div className="home-copy">
        <p className="rhythm-name">S L E E E P P Y</p>
        <h1>AlgoRythm</h1>
        <button type="button" className="home-go press" onClick={onOpenLog}>
          기록 보기
        </button>
      </div>
    </main>
  );
}
