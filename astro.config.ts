import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { versions } from "./versions.config.ts";

const defaultVersion = versions.find((v) => v.default) ?? versions[0];

export default defineConfig({
  site: "https://pluggy.sh",
  redirects: {
    "/docs": `/docs/${defaultVersion.slug}/getting-started`,
  },
  integrations: [
    starlight({
      title: "pluggy",
      description: "A command-line tool for Minecraft plugin development.",
      logo: { src: "./src/assets/logo.svg", replacesTitle: true },
      social: { github: "https://github.com/pluggy-sh/pluggy" },
      editLink: {
        baseUrl: "https://github.com/pluggy-sh/pluggy/edit/main/",
      },
      sidebar: versions.map((v) => ({
        label: v.label,
        collapsed: !v.default,
        autogenerate: { directory: `docs/${v.slug}` },
      })),
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
