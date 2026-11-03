import { useEffect } from "react";
import { PostBody } from "../components/PostBody.tsx";

const sample = `{blue}파란 글{/}과 {bg:gray}배경{/}.

{bold:blue}같이{/} 쓸 수 있고, {link:https://example.com}[BOJ 0000] 문제{/}처럼 이름에 괄호가 있어도 됩니다.`;

export function DocsScreen() {
  useEffect(() => {
    document.title = "문법 · AlgoRythm";
  }, []);

  return (
    <main className="column">
      <h1>문법</h1>
      <p className="intro">제목, 목록, 인용, 표, 링크, 코드 블록은 마크다운 그대로입니다. Enter는 줄바꿈이고 빈 줄은 문단입니다.</p>
      <ul className="syntax">
        <li>
          <code>{"{blue}글{/}"}</code>
          <span>글자색. gray brown orange yellow green blue purple pink red</span>
        </li>
        <li>
          <code>{"{bg:gray}글{/}"}</code>
          <span>배경. 색 이름 또는 default</span>
        </li>
        <li>
          <code>{"{bold:blue}글{/}"}</code>
          <span>굵게와 글자색. italic, strike, code 도 같음. {"{bold}"}만 쓰면 굵게만</span>
        </li>
        <li>
          <code>{"{link:https://주소}보이는 이름{/}"}</code>
          <span>이름에 괄호가 있을 때</span>
        </li>
        <li>
          <code>{"글<br>다음"}</code>
          <span>그 자리에서 줄바꿈. 줄 끝의 \ 도 같음</span>
        </li>
      </ul>
      <PostBody source={sample} />
    </main>
  );
}
