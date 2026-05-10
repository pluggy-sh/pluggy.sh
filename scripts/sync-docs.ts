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

function extractDescription(body: string): string | null {
  const lines = stripFirstH1(body).split("\n");
  const para: string[] = [];
  let inFence = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("```")) {
      inFence = !inFence;
      if (para.length) break;
      continue;
    }
    if (inFence) continue;
    const trimmed = line.trim();
    if (!trimmed) {
      if (para.length) break;
      continue;
    }
    if (/^(#{1,6}\s|[-*+]\s|\d+\.\s|>|\||<)/.test(trimmed)) {
      if (para.length) break;
      continue;
    }
    para.push(trimmed);
  }
  if (!para.length) return null;
  let text = para
    .join(" ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > 160) text = `${text.slice(0, 157).trimEnd()}...`;
  return text || null;
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
    // README pages become section overviews; their upstream H1 is usually
    // a generic "<repo> docs" that doesn't read well as a sidebar entry.
    const title =
      baseName === "README"
        ? "Overview"
        : extractTitle(raw, baseName.replace(/-/g, " "));

    const outRel = rel === "README.md" || rel.endsWith("/README.md")
      ? rel.replace(/README\.md$/, "index.md")
      : rel;
    const outPath = join(dst, outRel);
    await mkdir(dirname(outPath), { recursive: true });

    const body = rewriteLinks(stripFirstH1(raw));
    const description = extractDescription(raw);
    const fmLines = [`title: ${JSON.stringify(title)}`];
    if (description) fmLines.push(`description: ${JSON.stringify(description)}`);
    const frontmatter = `---\n${fmLines.join("\n")}\n---\n\n`;
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
