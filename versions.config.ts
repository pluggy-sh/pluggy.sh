export type DocsVersion = {
  /** Slug used in URLs, e.g. `latest`, `v0.2`, `v0.1`. */
  slug: string;
  /** Human label shown in the version dropdown. */
  label: string;
  /** Concrete git tag in `pluggy-sh/pluggy` whose `docs/` is rendered. */
  tag: string;
  /** Marks the default version that `/docs` redirects to. Exactly one. */
  default?: boolean;
};

export const versions: DocsVersion[] = [
  { slug: "latest", label: "Latest (v0.3)", tag: "v0.3.0", default: true },
  { slug: "v0.3", label: "v0.3", tag: "v0.3.0" },
  { slug: "v0.2", label: "v0.2", tag: "v0.2.3" },
];

export const upstream = {
  owner: "pluggy-sh",
  repo: "pluggy",
  /** Path within the upstream repo whose contents become this version's docs. */
  docsPath: "docs",
};
