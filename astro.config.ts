import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";
import { versions } from "./versions.config.ts";

const defaultVersion = versions.find((v) => v.default) ?? versions[0];

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
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: true,
      },
      social: { github: "https://github.com/pluggy-sh/pluggy" },
      editLink: {
        baseUrl: "https://github.com/pluggy-sh/pluggy/edit/main/",
      },
      sidebar: versions.map((v) => ({
        label: v.label,
        collapsed: !v.default,
        autogenerate: { directory: v.slug },
      })),
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
