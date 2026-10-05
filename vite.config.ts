import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";

// Nitro's own ignore list; a custom `onwarn` replaces Nitro's, so it is repeated here.
const NITRO_IGNORED_WARNINGS = new Set([
	"EVAL",
	"CIRCULAR_DEPENDENCY",
	"THIS_IS_UNDEFINED",
	"EMPTY_BUNDLE",
]);

const config = defineConfig({
	resolve: { tsconfigPaths: true },
	plugins: [
		devtools(),
		nitro({
			rollupConfig: { external: [/^@sentry\//] },
			// Vite 8 bundles the server with Rolldown, so the warning filter goes here.
			rolldownConfig: {
				onwarn(warning, warn) {
					if (NITRO_IGNORED_WARNINGS.has(warning.code ?? "")) return;
					// Libraries mark client hooks with "use client". Without RSC (ADR 0011) the
					// directive means nothing in the server bundle, so dropping it is expected.
					if (
						warning.code === "MODULE_LEVEL_DIRECTIVE" &&
						warning.message.includes('"use client"')
					)
						return;
					warn(warning);
				},
			},
			// The build runs under Bun, which would otherwise select Vercel's Bun runtime (ADR 0005).
			vercel: { functions: { runtime: "nodejs24.x" } },
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		babel({ presets: [reactCompilerPreset()] }),
	],
});

export default config;
