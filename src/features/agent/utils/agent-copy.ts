import { absoluteUrl } from "#/features/seo/seo.utils";
import type {
	CopyHome,
	CopyProject,
	CopyProjectRow,
	CopySkill,
	CopySkillRow,
} from "../agent.types";
import { agentCopyPath } from "./view-paths";

/**
 * The agent copies (ADR 0021): every page as Markdown, built from the same
 * content as the page. The `.md` files and the `/ai` views both render these
 * strings, so the two cannot drift. Every link is absolute, so a copy read on
 * its own still points at the site.
 */

/**
 * Text for a table cell: one line, with each `|` escaped so it cannot end the
 * cell. Backslashes right before a pipe are doubled too: escaping only the
 * pipe would turn `x\|y` into `x\\|y`, an escaped backslash and a cell break.
 */
export function tableCell(text: string) {
	return text
		.replace(/\s*\n\s*/g, " ")
		.replace(/(\\*)\|/g, (_, slashes: string) => `${slashes}${slashes}\\|`)
		.trim();
}

/** A GFM table. Empty strings render as empty cells. */
export function markdownTable(head: string[], rows: string[][]) {
	const line = (cells: string[]) => `| ${cells.map(tableCell).join(" | ")} |`;
	return [line(head), line(head.map(() => "---")), ...rows.map(line)].join(
		"\n",
	);
}

/** The facts block: a Field/Value table, leaving out fields with no value. */
export function factsTable(facts: [field: string, value: string | null][]) {
	const rows = facts.filter(
		(fact): fact is [string, string] => !!fact[1]?.trim(),
	);
	return markdownTable(["Field", "Value"], rows);
}

/** A Markdown link, with brackets in the text escaped. */
export function markdownLink(text: string, url: string) {
	return `[${text.replace(/([[\]\\])/g, "\\$1")}](${url})`;
}

/** Paragraphs and blocks joined by blank lines; empty parts are skipped. */
function blocks(...parts: (string | null | undefined | false)[]) {
	return `${parts
		.filter((part): part is string => typeof part === "string" && !!part.trim())
		.map((part) => part.trim())
		.join("\n\n")}\n`;
}

const STATUS_LABEL = { ONGOING: "Ongoing", COMPLETED: "Completed" } as const;

function pageLine(path: string, origin: string) {
	return `Human page: ${absoluteUrl(path, origin)}`;
}

/** `/projects/<slug>`: the case study's facts, then its write-up. */
export function projectCopy(project: CopyProject, origin: string) {
	return blocks(
		`# ${project.title}`,
		project.description,
		factsTable([
			["Status", STATUS_LABEL[project.status]],
			["Started", project.startedAt],
			["Ended", project.endedAt],
			["Team", project.teamName],
			["Featured", project.featured ? "Yes" : null],
			["Tools", project.tools.join(", ")],
			[
				"Credits",
				project.credits
					.map((credit) => {
						const name = credit.profileUrl
							? markdownLink(credit.name, credit.profileUrl)
							: credit.name;
						return credit.role ? `${name} (${credit.role})` : name;
					})
					.join(", "),
			],
			["Live site", project.liveUrl],
			["GitHub", project.githubUrl],
			...project.metadata.map((row): [string, string] => [
				row.label,
				row.value,
			]),
		]),
		pageLine(`/projects/${project.slug}`, origin),
		project.bodyMarkdown,
	);
}

/** `/projects`: every project in the page's order, featured first. */
export function projectsCopy(
	projects: CopyProjectRow[],
	description: string,
	origin: string,
) {
	return blocks(
		"# Projects",
		description,
		pageLine("/projects", origin),
		markdownTable(
			["#", "Project", "Description", "Status", "Started", "Tools"],
			projects.map((project) => [
				project.number,
				markdownLink(
					project.featured ? `${project.title} (featured)` : project.title,
					absoluteUrl(`/projects/${project.slug}`, origin),
				),
				project.description,
				STATUS_LABEL[project.status],
				project.startedAt,
				project.tools.join(", "),
			]),
		),
	);
}

/** `/skills/<slug>`: the skill's facts, its overview, and its projects. */
export function skillCopy(skill: CopySkill, origin: string) {
	return blocks(
		`# ${skill.name}`,
		factsTable([
			["Confidence", `${skill.confidence}/100`],
			["Top skill", skill.top ? "Yes" : null],
			["Tools", skill.tools.join(", ")],
		]),
		pageLine(`/skills/${skill.slug}`, origin),
		skill.overviewMarkdown,
		skill.projects.length > 0 && "## Projects that used these tools",
		skill.projects.length > 0 &&
			markdownTable(
				["#", "Project", "Year", "Status", "Tools"],
				skill.projects.map((project) => [
					project.number,
					markdownLink(
						project.title,
						absoluteUrl(`/projects/${project.slug}`, origin),
					),
					project.year,
					STATUS_LABEL[project.status],
					project.tools.join(", "),
				]),
			),
	);
}

/** `/skills`: every skill in the page's order, top skills first. */
export function skillsCopy(
	skills: CopySkillRow[],
	description: string,
	origin: string,
) {
	return blocks(
		"# Skills",
		description,
		pageLine("/skills", origin),
		markdownTable(
			["Skill", "Confidence", "Tools"],
			skills.map((skill) => [
				markdownLink(
					skill.top ? `${skill.name} (top skill)` : skill.name,
					absoluteUrl(`/skills/${skill.slug}`, origin),
				),
				`${skill.confidence}/100`,
				skill.tools.join(", "),
			]),
		),
	);
}

/** Every agent file's path, for the home copy's list: llms.txt, the sitemap, then the copies. */
export function agentFileList(pagePaths: string[]) {
	return ["/llms.txt", "/sitemap.md", ...pagePaths.map(agentCopyPath)];
}

/** `/`: who the owner is, the featured projects and top skills, contact, and the agent files. */
export function homeCopy(home: CopyHome, origin: string) {
	return blocks(
		`# ${home.name}`,
		home.description,
		...home.about,
		pageLine("/", origin),
		"## Featured projects",
		home.featured
			.map(
				(project) =>
					`- ${markdownLink(project.title, absoluteUrl(`/projects/${project.slug}`, origin))}: ${project.description}`,
			)
			.join("\n"),
		"## Top skills",
		home.topSkills
			.map(
				(skill) =>
					`- ${markdownLink(skill.name, absoluteUrl(`/skills/${skill.slug}`, origin))}: confidence ${skill.confidence}/100. Tools: ${skill.tools.join(", ")}`,
			)
			.join("\n"),
		"## Contact",
		home.contact.map((item) => `- ${item.label}: ${item.value}`).join("\n"),
		"## Agent files",
		agentFileList(home.pagePaths)
			.map((file) => `- ${markdownLink(file, absoluteUrl(file, origin))}`)
			.join("\n"),
	);
}

/** `/llms.txt` (llmstxt.org): the site in one paragraph, then a link to every copy. */
export function llmsTxt(
	home: CopyHome,
	pages: { path: string; title: string; description: string }[],
	origin: string,
) {
	const entry = (page: { path: string; title: string; description: string }) =>
		`- ${markdownLink(page.title, absoluteUrl(agentCopyPath(page.path), origin))}: ${tableCell(page.description)}`;
	const section = (prefix: string) =>
		pages.filter((page) => page.path.startsWith(prefix)).map(entry);
	return blocks(
		`# ${home.siteName}`,
		`> ${home.description}`,
		`Every page on this site has a Markdown copy at its path plus \`.md\` (${markdownLink("/index.md", absoluteUrl("/index.md", origin))} for the home page). Each one is readable in the browser under \`/ai\`.`,
		"## Pages",
		pages
			.filter((page) => ["/", "/projects", "/skills"].includes(page.path))
			.map(entry)
			.join("\n"),
		"## Projects",
		section("/projects/").join("\n"),
		"## Skills",
		section("/skills/").join("\n"),
		"## Optional",
		[
			`- ${markdownLink("Sitemap", absoluteUrl("/sitemap.md", origin))}: every page, with its URL and its Markdown copy`,
			`- ${markdownLink("CV", absoluteUrl(home.cvPath, origin))}: PDF`,
		].join("\n"),
	);
}

/** `/sitemap.md`: every page, its URL and its agent copy. */
export function sitemapMd(
	pages: { path: string; title: string }[],
	siteName: string,
	origin: string,
) {
	return blocks(
		"# Sitemap",
		`Every page on ${siteName}, with its Markdown copy.`,
		markdownTable(
			["Page", "URL", "Agent copy"],
			pages.map((page) => [
				page.title,
				absoluteUrl(page.path, origin),
				absoluteUrl(agentCopyPath(page.path), origin),
			]),
		),
	);
}
