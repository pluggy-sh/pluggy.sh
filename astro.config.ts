import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { versions } from "./versions.config.ts";

const defaultVersion = versions.find((v) => v.default) ?? versions[0];

const COMMAND_ORDER = [
  "init",
  "install",
  "remove",
  "build",
  "dev",
  "test",
  "search",
  "list",
  "outdated",
  "audit",
  "why",
  "info",
  "doctor",
  "upgrade",
  "cache",
  "sdk",
  "completions",
  "docs",
];

function sidebarFor(slug: string) {
  const link = (path: string) => `/${slug}/${path}/`;
  return [
    {
      label: "Get started",
      items: [
        { label: "Overview", link: link("") },
        { label: "Getting started", link: link("getting-started") },
        { label: "Glossary", link: link("glossary") },
      ],
    },
    {
      label: "Guides",
      items: [
        { label: "project.json reference", link: link("project-json") },
        { label: "Dependencies", link: link("dependencies") },
        { label: "Build pipeline", link: link("build-pipeline") },
        { label: "Dev server", link: link("dev-server") },
        { label: "Workspaces", link: link("workspaces") },
        { label: "IDE integration", link: link("ide") },
        { label: "Cross-platform", link: link("cross-platform") },
        { label: "Troubleshooting", link: link("troubleshooting") },
      ],
    },
    {
      label: "Commands",
      items: COMMAND_ORDER.map((cmd) => ({
        label: cmd,
        link: link(`commands/${cmd}`),
      })),
    },
    {
      label: "Recipes",
      autogenerate: { directory: `${slug}/recipes` },
    },
  ];
}

const SITE_URL = "https://pluggy.sh";
const OG_IMAGE = `${SITE_URL}/og.png`;

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  redirects: {
    "/docs": `/${defaultVersion.slug}/getting-started`,
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/404"),
    }),
    starlight({
      title: "pluggy",
      description: "A command-line tool for Minecraft plugin development.",
      logo: {
        light: "./src/assets/logo-dark.svg",
        dark: "./src/assets/logo-light.svg",
        replacesTitle: true,
      },
      social: { github: "https://github.com/pluggy-sh/pluggy" },
      editLink: {
        baseUrl: "https://github.com/pluggy-sh/pluggy/edit/main/",
      },
      sidebar: sidebarFor(defaultVersion.slug),
      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "apple-touch-icon",
            sizes: "180x180",
            href: "/apple-touch-icon.png",
          },
        },
        { tag: "meta", attrs: { name: "theme-color", content: "#0b0b0f" } },
        { tag: "meta", attrs: { property: "og:type", content: "website" } },
        { tag: "meta", attrs: { property: "og:site_name", content: "pluggy" } },
        { tag: "meta", attrs: { property: "og:image", content: OG_IMAGE } },
        { tag: "meta", attrs: { property: "og:image:width", content: "1200" } },
        { tag: "meta", attrs: { property: "og:image:height", content: "630" } },
        { tag: "meta", attrs: { name: "twitter:card", content: "summary_large_image" } },
        { tag: "meta", attrs: { name: "twitter:image", content: OG_IMAGE } },
        {
          tag: "script",
          attrs: { type: "application/ld+json" },
          content: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "pluggy",
            description:
              "A single-binary CLI for Minecraft plugin development. Scaffold, build, and run Paper/Folia/Spigot/Velocity plugins without managing a JDK or build tool.",
            url: SITE_URL,
            applicationCategory: "DeveloperApplication",
            operatingSystem: "macOS, Linux, Windows",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        },
      ],
    }),
  ],
});
