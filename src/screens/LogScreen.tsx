import { useEffect } from "react";
import { entries, excerpt, type Entry } from "../data.ts";
import { LanguageTag } from "../components/LanguageTag.tsx";

type LogScreenProps = {
  onOpen: (id: string) => void;
  onWrite: () => void;
};

export function LogScreen({ onOpen, onWrite }: LogScreenProps) {
  useEffect(() => {
    document.title = "기록 · AlgoRythm";
  }, []);

  return (
    <main className="column">
      <div className="log-head">
        <div>
          <h1>기록</h1>
          <p className="intro">AlgoRythm</p>
        </div>
        <button type="button" className="write-link press" onClick={onWrite}>
          <PenIcon />
          <span>글쓰기</span>
        </button>
      </div>
      <ul className="list">
        {entries.map((entry) => (
          <li key={entry.id}>
            <EntryRow entry={entry} onOpen={onOpen} />
          </li>
        ))}
      </ul>
    </main>
  );
}

function EntryRow({
  entry,
  onOpen,
}: {
  entry: Entry;
  onOpen: (id: string) => void;
}) {
  return (
    <button type="button" className="row press" onClick={() => onOpen(entry.id)}>
      <span className="row-date">{entry.stamp}</span>
      <LanguageTag lang={entry.lang} />
      <span className="row-title">{entry.problem}</span>
      {excerpt(entry) ? <span className="row-line">{excerpt(entry)}</span> : null}
    </button>
  );
}

function PenIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M9.2 2.4l4.4 4.4L6.2 14.2H1.8V9.8L9.2 2.4z" />
      <path d="M7.6 4l4.4 4.4" />
    </svg>
  );
}
