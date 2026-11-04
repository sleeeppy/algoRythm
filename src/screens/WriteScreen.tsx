import { useEffect, useMemo, useRef, useState } from "react";
import { rawPost } from "../data.ts";
import { PostBody } from "../components/PostBody.tsx";
import { indexAtPoint, insertBlock, isImageFile, prepareImage, uploadImage } from "../media.ts";
import { composePost, parsePost, readPost } from "../markdown.ts";
import type { EntryLink } from "../types.ts";

const sample = `여기에 본문을 적습니다.

\`코드\` 는 작게 강조되고, **굵게**도 됩니다.
{blue}파란 글{/} 과 {bg:gray}배경{/} 도 쓸 수 있습니다.

- 목록도 됩니다

\`\`\`C#
Console.WriteLine("hello");
\`\`\``;

type WriteScreenProps = {
  editId?: string | null;
  hidden?: boolean;
  onDone: () => void;
  onOpenDocs: () => void;
};

function draftFrom(editId?: string | null) {
  const source = editId ? rawPost(editId) : "";
  if (!source) {
    return {
      stamp: "",
      problem: "",
      lang: "",
      description: "",
      href: "",
      label: "",
      extra: [] as EntryLink[],
      body: sample,
    };
  }
  const post = readPost(source);
  const [first, ...extra] = post.links;
  return {
    stamp: post.stamp,
    problem: post.problem,
    lang: post.lang,
    description: post.description,
    href: first?.href ?? "",
    label: first?.label ?? "",
    extra,
    body: post.body,
  };
}

export function WriteScreen({ editId, hidden, onDone, onOpenDocs }: WriteScreenProps) {
  const [draft] = useState(() => draftFrom(editId));

  useEffect(() => {
    if (hidden) return;
    document.title = `${editId ? "글 수정" : "글 쓰기"} · AlgoRythm`;
  }, [editId, hidden]);
  const [stamp, setStamp] = useState(draft.stamp);
  const [problem, setProblem] = useState(draft.problem);
  const [lang, setLang] = useState(draft.lang);
  const [description, setDescription] = useState(draft.description);
  const [href, setHref] = useState(draft.href);
  const [label, setLabel] = useState(draft.label);
  const [body, setBody] = useState(draft.body);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [shots, setShots] = useState<ReadonlyMap<string, string>>(() => new Map());
  const bodyState = useRef(body);
  const shotsState = useRef(shots);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const files = useRef(new Map<string, Blob>());
  const tail = useRef(Promise.resolve());
  bodyState.current = body;
  shotsState.current = shots;

  const shown = useMemo(() => {
    let next = body;
    for (const [src, url] of shots) {
      if (next.includes(src)) next = next.split(src).join(url);
    }
    return next;
  }, [body, shots]);

  const preview = useMemo(() => {
    const links: EntryLink[] = href.trim()
      ? [{ href: href.trim(), label: label.trim() || href.trim() }]
      : [];
    try {
      parsePost(composePost({ stamp: stamp || "20260101", problem: problem || "제목", lang: lang || "Text", description, links, body }));
      return { error: "" };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "미리보기를 만들지 못했습니다." };
    }
  }, [stamp, problem, lang, description, href, label, body]);

  function hasFiles(data: DataTransfer | null) {
    return Boolean(data && [...data.types].includes("Files"));
  }

  function addImages(list: File[], index: number) {
    const job = tail.current.then(() => placeImages(list, index));
    tail.current = job.then(
      () => undefined,
      () => undefined,
    );
  }

  async function placeImages(list: File[], index: number) {
    try {
      setMessage("");
      const prepared = [];
      for (const file of list) prepared.push(await prepareImage(file));
      let next = bodyState.current;
      let at = index;
      const additions = new Map(shotsState.current);
      for (const item of prepared) {
        const src = `/media/${item.name}`;
        files.current.set(src, item.blob);
        additions.set(src, URL.createObjectURL(item.blob));
        const inserted = insertBlock(next, at, `![](${src})`);
        next = inserted.next;
        at = inserted.cursor;
      }
      bodyState.current = next;
      shotsState.current = additions;
      setBody(next);
      setShots(additions);
      requestAnimationFrame(() => {
        const field = fieldRef.current;
        if (!field) return;
        field.focus();
        field.setSelectionRange(at, at);
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "사진을 넣지 못했습니다.");
    }
  }

  async function publish() {
    setPending(true);
    setMessage("");
    try {
      const links: EntryLink[] = [
        ...(href.trim() ? [{ href: href.trim(), label: label.trim() || href.trim() }] : []),
        ...draft.extra,
      ];
      for (const [src, blob] of files.current) {
        if (!body.includes(src)) continue;
        await uploadImage(src.slice("/media/".length), blob, key);
      }
      const content = composePost({ stamp, problem, lang, description, links, body });
      parsePost(content);
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, content }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) throw new Error(result.error || "올리지 못했습니다.");
      onDone();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "올리지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="column composer" hidden={hidden}>
      <div className="composer-head">
        <h1>{editId ? "글 수정" : "글 쓰기"}</h1>
        <button type="button" className="docs-link press" onClick={onOpenDocs}>
          문법
        </button>
      </div>
      <p className="intro">마크다운으로 적으면 posts 폴더의 md 파일이 됩니다. 사진은 본문에 끌어다 놓으면 그 자리에 들어갑니다.</p>
      <div className="composer-meta">
        <label>
          날짜
          <input value={stamp} onChange={(event) => setStamp(event.target.value)} placeholder="20261101" inputMode="numeric" />
        </label>
        <label>
          제목
          <input value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="문제 이름" />
        </label>
        <label>
          언어
          <input value={lang} onChange={(event) => setLang(event.target.value)} placeholder="C#" />
        </label>
        <label>
          설명
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="목록에 보일 한 줄" />
        </label>
        <label>
          문제 링크
          <input value={href} onChange={(event) => setHref(event.target.value)} placeholder="https://" />
        </label>
        <label>
          링크 이름
          <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="[BOJ 0000] 문제" />
        </label>
      </div>
      <div className="composer-split">
        <section className="preview">
          <h2>미리보기</h2>
          {preview.error ? <p className="composer-message">{preview.error}</p> : null}
          <PostBody source={shown} />
        </section>
        <div className="composer-form">
          <label
            className={dropping ? "composer-body is-dropping" : "composer-body"}
            onDragEnter={(event) => {
              if (!hasFiles(event.dataTransfer)) return;
              event.preventDefault();
              setDropping(true);
            }}
            onDragOver={(event) => {
              if (!hasFiles(event.dataTransfer)) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
            }}
            onDragLeave={(event) => {
              if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
              setDropping(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDropping(false);
              const images = [...event.dataTransfer.files].filter(isImageFile);
              const field = fieldRef.current;
              if (!images.length || !field) {
                setMessage("사진만 넣을 수 있습니다.");
                return;
              }
              const rect = field.getBoundingClientRect();
              const inside =
                event.clientX >= rect.left &&
                event.clientX <= rect.right &&
                event.clientY >= rect.top &&
                event.clientY <= rect.bottom;
              const index = inside ? indexAtPoint(field, event.clientX, event.clientY) : field.selectionStart;
              addImages(images, index);
            }}
          >
            본문
            <textarea
              ref={fieldRef}
              value={body}
              onChange={(event) => setBody(event.target.value)}
              onPaste={(event) => {
                const images = [...event.clipboardData.files].filter(isImageFile);
                if (!images.length) return;
                event.preventDefault();
                addImages(images, event.currentTarget.selectionStart);
              }}
              spellCheck={false}
            />
          </label>
          <div className="preview-foot">
            {message ? <p className="composer-message">{message}</p> : null}
            <div className="preview-actions">
              <label>
                등록 키
                <input value={key} onChange={(event) => setKey(event.target.value)} type="password" placeholder="배포된 사이트에서만 필요" />
              </label>
              <button type="button" className="home-go press" onClick={publish} disabled={pending}>
                {pending ? "올리는 중" : editId ? "저장" : "올리기"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
