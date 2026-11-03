import { useEffect } from "react";
import { entries, findEntry } from "../data.ts";
import { LanguageTag } from "../components/LanguageTag.tsx";
import { PostBody } from "../components/PostBody.tsx";

type DayScreenProps = {
  id: string;
  onOpen: (id: string, dir?: "forward" | "back") => void;
  onEdit: (id: string) => void;
};

export function DayScreen({ id, onOpen, onEdit }: DayScreenProps) {
  const entry = findEntry(id);
  const index = entries.findIndex((item) => item.id === entry.id);
  const newer = index > 0 ? entries[index - 1] : undefined;
  const older =
    index >= 0 && index < entries.length - 1 ? entries[index + 1] : undefined;

  useEffect(() => {
    document.title = `${entry.problem} · AlgoRythm`;
  }, [entry.problem]);

  return (
    <main className="column" data-article="">
      <p className="meta">
        <time dateTime={entry.stamp}>{entry.stamp}</time>
        <LanguageTag lang={entry.lang} />
      </p>
      <div className="title-row">
        <h1>{entry.problem}</h1>
        <div className="title-actions">
          {entry.links.map((link) => (
            <a
              key={link.href}
              className="link-button press"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="2.25" y="1.75" width="11.5" height="12.5" rx="2" />
                <path d="M5 6h6M5 8.5h6M5 11h4" />
              </svg>
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
      <PostBody source={entry.body} />
      <div className="edit-row">
        <button type="button" className="edit-link press" onClick={() => onEdit(entry.id)}>
          <PenIcon />
          <span>수정</span>
        </button>
      </div>
      <nav className="adjacent" aria-label="다른 날">
        {older ? (
          <button type="button" className="side press" onClick={() => onOpen(older.id, "back")}>
            <span className="side-line">
              <span className="kicker" aria-label="이전">
                {"<"}
              </span>
              <span className="side-title">{older.problem}</span>
            </span>
            <span className="side-date">{older.stamp}</span>
          </button>
        ) : (
          <span />
        )}
        {newer ? (
          <button type="button" className="side next press" onClick={() => onOpen(newer.id, "forward")}>
            <span className="side-line">
              <span className="kicker" aria-label="이후">
                {">"}
              </span>
              <span className="side-title">{newer.problem}</span>
            </span>
            <span className="side-date">{newer.stamp}</span>
          </button>
        ) : (
          <span />
        )}
      </nav>
    </main>
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
