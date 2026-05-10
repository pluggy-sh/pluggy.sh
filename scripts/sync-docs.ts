#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { $ } from "bun";
import { upstream, versions } from "../versions.config.ts";

const ROOT = new URL("..", import.meta.url).pathname;
const CACHE = join(ROOT, ".cache", "tags");
const OUT = join(ROOT, "src", "content", "docs");

async function fetchTag(tag: string): Promise<string> {
  const dest = join(CACHE, tag);
  if (existsSync(join(dest, upstream.docsPath))) return dest;

  await rm(dest, { recursive: true, force: true });
  await mkdir(CACHE, { recursive: true });

  const url = `https://github.com/${upstream.owner}/${upstream.repo}.git`;
  await $`git clone --depth 1 --branch ${tag} --single-branch --no-tags ${url} ${dest}`.quiet();
  return dest;
}

async function* walk(dir: string): AsyncIterable<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const TITLE_RE = /^#\s+(.+?)\s*$/m;

function extractTitle(body: string, fallback: string): string {
  const raw = body.match(TITLE_RE)?.[1] ?? fallback;
  // Strip backticks so command titles like `pluggy audit` don't render as
  // literal backtick characters in the sidebar / page header.
  return raw.replace(/`/g, "");
}

function stripFirstH1(body: string): string {
  return body.replace(TITLE_RE, "").replace(/^\n+/, "");
}

function rewriteLinks(body: string): string {
  // Strip the .md extension from in-repo links so Starlight resolves them as routes.
  return body.replace(/(\]\([^)]+?)\.md(#[^)]*)?\)/g, "$1$2)");
}

async function transform(srcRoot: string, slug: string) {
  const src = join(srcRoot, upstream.docsPath);
  const dst = join(OUT, slug);
  await rm(dst, { recursive: true, force: true });

  for await (const file of walk(src)) {
    const rel = relative(src, file);
    if (!rel.endsWith(".md")) continue;

    const raw = await readFile(file, "utf8");
    const fileSlug = rel.replace(/\.md$/, "").replace(/\\/g, "/");
    const baseName = fileSlug.split("/").pop()!;
    const fallback = baseName === "README" ? "Overview" : baseName.replace(/-/g, " ");
    const title = extractTitle(raw, fallback);

    const outRel = rel === "README.md" || rel.endsWith("/README.md")
      ? rel.replace(/README\.md$/, "index.md")
      : rel;
    const outPath = join(dst, outRel);
    await mkdir(dirname(outPath), { recursive: true });

    const body = rewriteLinks(stripFirstH1(raw));
    const frontmatter = `---\ntitle: ${JSON.stringify(title)}\n---\n\n`;
    await writeFile(outPath, frontmatter + body);
  }
}

const start = Date.now();
console.log(`Syncing docs for ${versions.length} versions...`);

for (const v of versions) {
  const cached = await fetchTag(v.tag);
  await transform(cached, v.slug);
  console.log(`  ${v.slug.padEnd(8)} <- ${upstream.owner}/${upstream.repo}@${v.tag}`);
}

console.log(`Done in ${((Date.now() - start) / 1000).toFixed(1)}s.`);
