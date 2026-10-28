import {
	existsSync,
	mkdirSync,
	readdirSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { AgentFile } from "#/features/agent/agent.types";

/** Root files the build writes; copies of projects and skills go in these folders. */
const ROOT_FILES = [
	"index.md",
	"projects.md",
	"skills.md",
	"llms.txt",
	"sitemap.md",
];
const COPY_FOLDERS = ["projects", "skills"];

/**
 * Removes every agent file an earlier build wrote into `publicDir`, so a
 * project that became a draft, or a gated build, leaves no stale copy.
 * Only `.md` files in the copy folders go; anything else there stays.
 */
export function removeAgentFiles(publicDir: string) {
	for (const name of ROOT_FILES) rmSync(join(publicDir, name), { force: true });
	for (const folder of COPY_FOLDERS) {
		const dir = join(publicDir, folder);
		if (!existsSync(dir)) continue;
		for (const name of readdirSync(dir)) {
			if (name.endsWith(".md")) rmSync(join(dir, name), { force: true });
		}
		if (readdirSync(dir).length === 0) rmSync(dir, { recursive: true });
	}
}

/** Paths come from content slugs; refuse anything that would leave `publicDir`. */
function isSafeFile(file: string) {
	return /^\/[a-z0-9][a-z0-9/-]*\.(md|txt)$/.test(file) && !file.includes("//");
}

/**
 * Writes the agent files into `publicDir`, replacing the last build's. A
 * gated site (coming soon) gets none. Returns the paths written.
 */
export function writeAgentFiles(
	publicDir: string,
	files: AgentFile[],
	gated: boolean,
): string[] {
	removeAgentFiles(publicDir);
	if (gated) return [];
	for (const { file, text } of files) {
		if (!isSafeFile(file)) throw new Error(`Refusing to write ${file}`);
		const target = join(publicDir, file);
		mkdirSync(dirname(target), { recursive: true });
		writeFileSync(target, text);
	}
	return files.map(({ file }) => file);
}
