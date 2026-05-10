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

export default defineConfig({
  site: "https://pluggy.sh",
  redirects: {
    "/docs": `/${defaultVersion.slug}/getting-started`,
  },
  integrations: [
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
    }),
  ],
});
