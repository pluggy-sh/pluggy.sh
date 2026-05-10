# pluggy.sh

The website and versioned documentation for [pluggy](https://github.com/pluggy-sh/pluggy), deployed to <https://pluggy.sh>.

## How it works

This repo holds the site framework — Astro + Starlight — and a build-time sync script that pulls `docs/` content from tagged releases of the main `pluggy` repo. Markdown lives in `pluggy-sh/pluggy`, not here, so a feature PR can change the code and the docs that describe it in the same commit.

```
pluggy-sh/pluggy           pluggy-sh/pluggy.sh           pluggy.sh
  docs/**             ->     scripts/sync-docs.ts   ->     /docs/v0.2/...
  install.sh          ->     vercel.json (rewrite)  ->     /install.sh
  install.ps1         ->     vercel.json (rewrite)  ->     /install.ps1
```

`vercel.json` proxies `pluggy.sh/install.sh` and `pluggy.sh/install.ps1` to the raw scripts on the main repo's `main` branch. They are not copied — every request reflects what is on `main` right now.

## Versions

`versions.config.ts` lists which git tags become which doc versions. To add a new version, append an entry and push:

```ts
{ slug: "v0.3", label: "v0.3", tag: "v0.3.0" },
```

The default version (`default: true`) is what `/docs` redirects to.

## Develop

```sh
bun install
bun run sync     # clones each tagged docs/ into src/content/docs/<slug>/
bun run dev
```

`bun run build` runs `sync` first so the version dropdown matches `versions.config.ts`.

## Deploy

Vercel builds on every push to `main` and on every PR (preview URL). Releases of `pluggy-sh/pluggy` fire a `repository_dispatch` event of type `pluggy-release` that re-runs the build, which picks up any new tag added to `versions.config.ts`.

## Install scripts

The shell installers live in [`pluggy-sh/pluggy`](https://github.com/pluggy-sh/pluggy) at `install.sh` and `install.ps1`. Edit them there.
