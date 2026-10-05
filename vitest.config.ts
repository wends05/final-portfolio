import { defineConfig } from "vitest/config";

// Separate from vite.config.ts so tests don't load the Nitro and TanStack Start plugins (ADR 0010).
export default defineConfig({
	resolve: { tsconfigPaths: true },
	test: {
		include: ["src/**/*.test.{ts,tsx}"],
		environment: "node",
	},
});
