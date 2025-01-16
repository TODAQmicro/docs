import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import node from "@astrojs/node";
import starlight from "@astrojs/starlight";
import starlightOpenAPI, { openAPISidebarGroups } from "starlight-openapi";

// https://astro.build/config
export default defineConfig({
    output: "server",
    site: "https://docs.m.todaq.net",
    integrations: [
        react(),
        starlight({
            plugins: [
                starlightOpenAPI([
                    {
                        base: "api",
                        label: "My API",
                        schema: "schemas/api-schema.yaml",
                        collapsed: false,
                    },
                ]),
            ],
            sidebar: [...openAPISidebarGroups],
            title: "Tapp Docs",
        }),
        mdx(),
        sitemap(),
    ],

    adapter: node({
        mode: "standalone",
    }),
});
