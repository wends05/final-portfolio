// Writes the agent copies, llms.txt and sitemap.md into public/ (ADR 0021).
// Runs before `vite build` (the `prebuild` script), after Velite: `bun run agent-files`.
import { fileURLToPath } from "node:url";
import { getAgentFiles } from "#/features/agent/agent.content";
import { isSiteGated } from "#/features/site/site.utils";
import { writeAgentFiles } from "./agent-files.utils";

const publicDir = fileURLToPath(new URL("../public/", import.meta.url));
const gated = isSiteGated(process.env.COMING_SOON);
const written = writeAgentFiles(publicDir, getAgentFiles(), gated);

console.log(
	gated
		? "Agent files: none written, the site is gated (COMING_SOON=true)."
		: `Agent files: wrote ${written.length} files to public/.`,
);
