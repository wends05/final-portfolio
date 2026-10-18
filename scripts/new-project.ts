// Scaffolds content/projects/<slug>/index.md: `bun run new:project <slug>`.
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
	isProjectSlug,
	projectTemplate,
	toDateString,
} from "./new-project.utils";

const slug = process.argv[2] ?? "";
if (!isProjectSlug(slug)) {
	console.error(
		"Usage: bun run new:project <slug>\nThe slug is kebab-case, 3 to 200 characters: baconawa-and-eggs",
	);
	process.exit(1);
}

const root = fileURLToPath(new URL("../", import.meta.url));
const folder = join(root, "content", "projects", slug);
if (existsSync(folder)) {
	console.error(`content/projects/${slug} already exists.`);
	process.exit(1);
}

mkdirSync(folder, { recursive: true });
writeFileSync(
	join(folder, "index.md"),
	projectTemplate(slug, toDateString(new Date())),
);
console.log(
	`Created content/projects/${slug}/index.md as a draft. Next: the "Adding content" steps in AGENTS.md.`,
);
