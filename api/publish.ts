import { parsePost } from "../src/markdown.ts";

const repo = process.env.GITHUB_REPO || "sleeeppy/algoRythm";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function github(pathname: string, init?: RequestInit) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN이 없습니다.");
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      accept: "application/vnd.github+json",
      authorization: `Bearer ${token}`,
      "user-agent": "algorythm",
      ...(init?.headers ?? {}),
    },
  });
  return response;
}

export async function POST(request: Request) {
  let payload: { key?: string; content?: string };
  try {
    payload = (await request.json()) as { key?: string; content?: string };
  } catch {
    return json({ ok: false, error: "내용을 읽지 못했습니다." }, 400);
  }

  const writeKey = process.env.WRITE_KEY;
  if (!writeKey) return json({ ok: false, error: "WRITE_KEY가 아직 설정되지 않았습니다." }, 501);
  if (payload.key !== writeKey) return json({ ok: false, error: "등록 키가 맞지 않습니다." }, 401);
  if (!payload.content?.trim()) return json({ ok: false, error: "본문이 비어 있습니다." }, 400);

  let entry;
  try {
    entry = parsePost(payload.content);
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "마크다운을 읽지 못했습니다." }, 400);
  }

  const file = `posts/${entry.stamp}.md`;
  try {
    const encoded = Buffer.from(payload.content, "utf8").toString("base64");
    const existing = await github(`/repos/${repo}/contents/${file}?ref=main`);
    let sha: string | undefined;
    if (existing.ok) {
      const current = (await existing.json()) as { sha?: string };
      sha = current.sha;
    } else if (existing.status !== 404) {
      return json({ ok: false, error: "기존 글을 확인하지 못했습니다." }, 502);
    }

    const saved = await github(`/repos/${repo}/contents/${file}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `${sha ? "Update" : "Add"} post ${entry.stamp}`,
        content: encoded,
        branch: "main",
        ...(sha ? { sha } : {}),
      }),
    });
    if (!saved.ok) return json({ ok: false, error: "깃허브에 올리지 못했습니다." }, 502);
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "깃허브에 올리지 못했습니다." }, 501);
  }

  return json({ ok: true, id: entry.id });
}
