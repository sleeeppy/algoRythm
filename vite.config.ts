import { mkdirSync, writeFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function publishPosts(): Plugin {
  return {
    name: "publish-posts",
    configureServer(server) {
      server.middlewares.use("/api/publish", (req, res, next) => {
        if (req.method !== "POST") {
          next();
          return;
        }
        void save(server, req, res);
      });
    },
  };
}

async function save(server: ViteDevServer, req: IncomingMessage, res: ServerResponse) {
  try {
    const payload = JSON.parse(await readBody(req)) as { content?: string };
    if (!payload.content?.trim()) throw new Error("본문이 비어 있습니다.");
    const loaded = (await server.ssrLoadModule(path.resolve(server.config.root, "src/markdown.ts"))) as {
      parsePost: (source: string) => { stamp: string };
    };
    const entry = loaded.parsePost(payload.content);
    const directory = path.join(server.config.root, "posts");
    mkdirSync(directory, { recursive: true });
    writeFileSync(path.join(directory, `${entry.stamp}.md`), payload.content);
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: true, local: true, id: entry.stamp }));
    server.ws.send({ type: "full-reload" });
  } catch (error) {
    res.statusCode = 400;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ ok: false, error: error instanceof Error ? error.message : "저장하지 못했습니다." }));
  }
}

export default defineConfig({
  plugins: [react(), publishPosts()],
});
