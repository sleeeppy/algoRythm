import { useMemo, useState } from "react";
import { Prose } from "../components/Prose.tsx";
import { composePost, parsePost } from "../markdown.ts";
import type { EntryLink } from "../types.ts";

const sample = `여기에 본문을 적습니다.

\`코드\` 는 작게 강조되고, **굵게**도 됩니다.
{blue}파란 글{/} 과 {bg:gray}배경{/} 도 쓸 수 있습니다.

- 목록도 됩니다

\`\`\`C#
Console.WriteLine("hello");
\`\`\``;

type WriteScreenProps = {
  onDone: () => void;
};

export function WriteScreen({ onDone }: WriteScreenProps) {
  const [stamp, setStamp] = useState("");
  const [problem, setProblem] = useState("");
  const [lang, setLang] = useState("");
  const [href, setHref] = useState("");
  const [label, setLabel] = useState("");
  const [body, setBody] = useState(sample);
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  const preview = useMemo(() => {
    const links: EntryLink[] = href.trim()
      ? [{ href: href.trim(), label: label.trim() || href.trim() }]
      : [];
    try {
      return {
        entry: parsePost(composePost({ stamp: stamp || "20260101", problem: problem || "제목", lang: lang || "Text", links, body })),
        error: "",
      };
    } catch (error) {
      return { entry: null, error: error instanceof Error ? error.message : "미리보기를 만들지 못했습니다." };
    }
  }, [stamp, problem, lang, href, label, body]);

  async function publish() {
    setPending(true);
    setMessage("");
    try {
      const links: EntryLink[] = href.trim()
        ? [{ href: href.trim(), label: label.trim() || href.trim() }]
        : [];
      const content = composePost({ stamp, problem, lang, links, body });
      parsePost(content);
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, content }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string; local?: boolean };
      if (!response.ok || !result.ok) throw new Error(result.error || "올리지 못했습니다.");
      setMessage(result.local ? "이 컴퓨터의 posts 폴더에 저장했습니다." : "마크다운을 올렸습니다. 배포가 끝나면 목록에 나타납니다.");
      if (result.local) onDone();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "올리지 못했습니다.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="column composer">
      <h1>글 쓰기</h1>
      <p className="intro">마크다운으로 적으면 posts 폴더의 md 파일이 됩니다.</p>
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
        문제 링크
        <input value={href} onChange={(event) => setHref(event.target.value)} placeholder="https://" />
      </label>
      <label>
        링크 이름
        <input value={label} onChange={(event) => setLabel(event.target.value)} placeholder="[BOJ 0000] 문제" />
      </label>
      <label>
        본문
        <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={16} spellCheck={false} />
      </label>
      <p className="composer-hint">
        **굵게** · `코드` · {"{blue}글{/}"} · {"{bg:gray}배경{/}"} · [이름](주소)
      </p>
      <label>
        등록 키
        <input value={key} onChange={(event) => setKey(event.target.value)} type="password" placeholder="배포된 사이트에서만 필요" />
      </label>
      <button type="button" className="home-go press" onClick={publish} disabled={pending}>
        {pending ? "올리는 중" : "올리기"}
      </button>
      {message ? <p className="composer-message">{message}</p> : null}
      <h2>미리보기</h2>
      {preview.error ? <p className="composer-message">{preview.error}</p> : null}
      {preview.entry ? <Prose pieces={preview.entry.pieces} /> : null}
    </main>
  );
}
