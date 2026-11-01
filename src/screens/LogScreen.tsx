import { useEffect } from "react";
import { entries, excerpt, type Entry } from "../data.ts";
import { LanguageTag } from "../components/LanguageTag.tsx";

type LogScreenProps = {
  onOpen: (id: string) => void;
};

export function LogScreen({ onOpen }: LogScreenProps) {
  useEffect(() => {
    document.title = "기록 · AlgoRythm";
  }, []);

  return (
    <main className="column">
      <h1>기록</h1>
      <p className="intro">AlgoRythm</p>
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
      <span className="row-line">{excerpt(entry)}</span>
    </button>
  );
}
