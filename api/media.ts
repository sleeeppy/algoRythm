import { isMediaName } from "../src/media.ts";

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
  let payload: { key?: string; name?: string; data?: string };
  try {
    payload = (await request.json()) as { key?: string; name?: string; data?: string };
  } catch {
    return json({ ok: false, error: "사진을 읽지 못했습니다." }, 400);
  }

  const writeKey = process.env.WRITE_KEY;
  if (!writeKey) return json({ ok: false, error: "WRITE_KEY가 아직 설정되지 않았습니다." }, 501);
  if (payload.key !== writeKey) return json({ ok: false, error: "등록 키가 맞지 않습니다." }, 401);
  if (!payload.name || !isMediaName(payload.name) || !payload.data) {
    return json({ ok: false, error: "사진을 올리지 못했습니다." }, 400);
  }

  const bytes = Buffer.from(payload.data, "base64");
  if (bytes.length === 0 || bytes.length > 8_000_000) {
    return json({ ok: false, error: "사진이 너무 큽니다." }, 400);
  }

  const file = `public/media/${payload.name}`;
  try {
    const existing = await github(`/repos/${repo}/contents/${file}?ref=main`);
    if (existing.ok) return json({ ok: true, src: `/media/${payload.name}` });
    if (existing.status !== 404) return json({ ok: false, error: "사진을 확인하지 못했습니다." }, 502);

    const saved = await github(`/repos/${repo}/contents/${file}`, {
      method: "PUT",
      body: JSON.stringify({
        message: `Add image ${payload.name}`,
        content: payload.data,
        branch: "main",
      }),
    });
    if (!saved.ok) return json({ ok: false, error: "사진을 깃허브에 올리지 못했습니다." }, 502);
  } catch (error) {
    return json({ ok: false, error: error instanceof Error ? error.message : "사진을 깃허브에 올리지 못했습니다." }, 501);
  }

  return json({ ok: true, src: `/media/${payload.name}` });
}
