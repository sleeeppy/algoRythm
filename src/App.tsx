import { useEffect, useRef, useState } from "react";
import { ProgressBar } from "./components/ProgressBar.tsx";
import { TopBar } from "./components/TopBar.tsx";
import { runTransition, type NavDir } from "./transition.ts";
import { DayScreen } from "./screens/DayScreen.tsx";
import { DocsScreen } from "./screens/DocsScreen.tsx";
import { HomeScreen } from "./screens/HomeScreen.tsx";
import { LogScreen } from "./screens/LogScreen.tsx";
import { WriteScreen } from "./screens/WriteScreen.tsx";

type View = "home" | "log" | "day" | "write" | "docs";

type HistoryState = {
  algorhythm: true;
  view: View;
  id: string | null;
};

function isHistoryState(value: unknown): value is HistoryState {
  if (!value || typeof value !== "object") return false;
  const state = value as HistoryState;
  return (
    state.algorhythm === true &&
    (state.view === "home" || state.view === "log" || state.view === "day" || state.view === "write" || state.view === "docs")
  );
}

function readHistory(): { view: View; id: string | null } {
  if (isHistoryState(history.state)) {
    return { view: history.state.view, id: history.state.id };
  }
  return { view: "home", id: null };
}

const initialHistory = readHistory();

export default function App() {
  const [view, setView] = useState<View>(initialHistory.view);
  const [entryId, setEntryId] = useState<string | null>(initialHistory.id);
  const writeOpened = useRef(false);

  useEffect(() => {
    history.scrollRestoration = "manual";
    if (!isHistoryState(history.state)) {
      history.replaceState(
        { algorhythm: true, view: "home", id: null } satisfies HistoryState,
        "",
      );
    }

    let browserIsAnimating = false;
    const navigation = (
      window as Window & {
        navigation?: EventTarget;
      }
    ).navigation;

    const onNavigate = (event: Event) => {
      const navigateEvent = event as Event & {
        navigationType?: string;
        hasUAVisualTransition?: boolean;
      };
      browserIsAnimating =
        navigateEvent.navigationType === "traverse" &&
        navigateEvent.hasUAVisualTransition === true;
    };

    const onPop = (event: PopStateEvent) => {
      if (!isHistoryState(event.state)) return;
      const next = event.state;
      const apply = () => {
        setView(next.view);
        setEntryId(next.id);
      };
      if (browserIsAnimating) {
        browserIsAnimating = false;
        apply();
        window.scrollTo(0, 0);
        return;
      }
      runTransition("back", apply);
    };

    navigation?.addEventListener("navigate", onNavigate);
    window.addEventListener("popstate", onPop);
    return () => {
      navigation?.removeEventListener("navigate", onNavigate);
      window.removeEventListener("popstate", onPop);
    };
  }, []);

  function show(dir: NavDir, next: HistoryState) {
    runTransition(dir, () => {
      setView(next.view);
      setEntryId(next.id);
    });
  }

  function openLog() {
    const next = { algorhythm: true, view: "log", id: null } as const;
    show("forward", next);
    history.pushState(next, "");
  }

  function openDay(id: string, dir: NavDir = "forward") {
    const next = { algorhythm: true, view: "day", id } as const;
    show(dir, next);
    if (view === "day") {
      history.replaceState(next, "");
      return;
    }
    if (view === "home") {
      history.pushState({ algorhythm: true, view: "log", id: null }, "");
    }
    history.pushState(next, "");
  }

  function back() {
    if (isHistoryState(history.state) && history.state.view !== "home") {
      history.back();
      return;
    }
    const next =
      view === "day"
        ? ({ algorhythm: true, view: "log", id: null } as const)
        : ({ algorhythm: true, view: "home", id: null } as const);
    show("back", next);
  }

  function openDocs() {
    const next = { algorhythm: true, view: "docs", id: entryId } as const;
    show("forward", next);
    history.pushState(next, "");
  }

  function openEdit(id: string) {
    const next = { algorhythm: true, view: "write", id } as const;
    const onLog = isHistoryState(history.state) && history.state.view === "log";
    show("forward", next);
    if (onLog) history.pushState(next, "");
    else history.replaceState(next, "");
    writeOpened.current = true;
  }

  function returnToLog() {
    const next = { algorhythm: true, view: "log", id: null } as const;
    if (writeOpened.current && isHistoryState(history.state) && history.state.view === "write") {
      writeOpened.current = false;
      history.back();
      return;
    }
    writeOpened.current = false;
    show("back", next);
    history.replaceState(next, "");
  }

  const watch = `${view}:${entryId ?? ""}`;

  return (
    <>
      <ProgressBar watch={watch} />
      {view === "home" ? null : (
        <TopBar
          backLabel={view === "log" ? "메인" : view === "docs" ? (entryId ? "글 수정" : "글 쓰기") : "기록"}
          onBack={back}
        />
      )}
      {view === "home" ? (
        <HomeScreen onOpenLog={openLog} />
      ) : null}
      {view === "log" ? <LogScreen onOpen={(id) => openDay(id, "forward")} onWrite={() => openEdit("")} /> : null}
      {view === "write" || view === "docs" ? (
        <WriteScreen key={entryId ?? "new"} editId={entryId} hidden={view !== "write"} onDone={returnToLog} onOpenDocs={openDocs} />
      ) : null}
      {view === "docs" ? <DocsScreen /> : null}
      {view === "day" && entryId ? (
        <DayScreen key={entryId} id={entryId} onOpen={(id, dir) => openDay(id, dir)} onEdit={openEdit} />
      ) : null}
    </>
  );
}
