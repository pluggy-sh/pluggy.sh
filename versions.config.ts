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
  // tag: "@latest" resolves to the most recent GitHub release at build time.
  // Pin a literal tag (e.g. "v0.4.1") to freeze a version in place.
  { slug: "latest", label: "Latest", tag: "@latest", default: true },
];

export const upstream = {
  owner: "pluggy-sh",
  repo: "pluggy",
  /** Path within the upstream repo whose contents become this version's docs. */
  docsPath: "docs",
};
