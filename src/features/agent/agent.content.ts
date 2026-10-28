import { PROJECTS_DESCRIPTION } from "#/features/projects/projects.content";
import {
	getMetadataRows,
	getProjectYear,
	orderProjects,
	padIndex,
	resolveCredits,
} from "#/features/projects/projects.utils";
import { ABOUT_PARAGRAPHS } from "#/features/public/utils/about";
import {
	CONTACT_LINKS,
	CV_PATH,
	EMAILS,
} from "#/features/public/utils/contact";
import {
	AUTHOR_NAME,
	DEFAULT_DESCRIPTION,
	SITE_NAME,
	SITE_ORIGIN,
} from "#/features/seo/seo.utils";
import { SKILLS_DESCRIPTION } from "#/features/skills/skills.content";
import {
	getProjectsUsingTools,
	orderSkillsPage,
} from "#/features/skills/skills.utils";
import { collaborators, projects, site, skills } from "#content";
import type { AgentCopy, AgentFile, CopyHome } from "./agent.types";
import {
	homeCopy,
	llmsTxt,
	projectCopy,
	projectsCopy,
	sitemapMd,
	skillCopy,
	skillsCopy,
} from "./utils/agent-copy";
import { agentCopyPath } from "./utils/view-paths";

/** How many featured projects and top skills the home page shows. */
const HOMEPAGE_LIMIT = 3;

/**
 * The origin the copies link to: `VITE_SITE_URL` when set, else the site's.
 * Vite reads it into the app; Bun reads it into the build script.
 */
export function getAgentOrigin(): string {
	const override = import.meta.env.VITE_SITE_URL;
	return (
		typeof override === "string" && override.trim()
			? override.trim()
			: SITE_ORIGIN
	).replace(/\/+$/, "");
}

// Drafts never get a copy, even when drafts are switched on for a preview.
const liveProjects = () =>
	orderProjects(
		projects.filter((p) => !p.draft),
		site.featured,
	);
const liveSkills = () =>
	orderSkillsPage(
		skills.filter((s) => !s.draft),
		site.topSkills,
	);

interface PageEntry {
	path: string;
	title: string;
	description: string;
	build: (origin: string) => string;
}

/** Every page with a copy, in sitemap order, each with how to build its Markdown. */
function pageEntries(): { pages: PageEntry[]; home: CopyHome } {
	const ordered = liveProjects();
	const skillList = liveSkills();
	const featured = new Set(site.featured);
	const top = new Set(site.topSkills);

	const projectEntries = ordered.map(
		(project): PageEntry => ({
			path: `/projects/${project.slug}`,
			title: project.title,
			description: project.description,
			build: (origin) =>
				projectCopy(
					{
						...project,
						endedAt: project.endedAt ?? null,
						teamName: project.teamName ?? null,
						githubUrl: project.githubUrl ?? null,
						liveUrl: project.liveUrl ?? null,
						credits: resolveCredits(project.credits, collaborators),
						metadata: getMetadataRows(project.metadata),
						featured: featured.has(project.slug),
					},
					origin,
				),
		}),
	);

	const skillEntries = skillList.map(
		(skill): PageEntry => ({
			path: `/skills/${skill.slug}`,
			title: skill.name,
			description: skill.description,
			build: (origin) =>
				skillCopy(
					{
						...skill,
						top: top.has(skill.slug),
						projects: getProjectsUsingTools(ordered, skill.tools).map(
							(project) => ({
								slug: project.slug,
								title: project.title,
								status: project.status,
								tools: project.tools,
								number: padIndex(
									ordered.findIndex((p) => p.slug === project.slug) + 1,
								),
								year: getProjectYear(project.startedAt),
							}),
						),
					},
					origin,
				),
		}),
	);

	const paths = [
		"/",
		"/projects",
		"/skills",
		...projectEntries.map((entry) => entry.path),
		...skillEntries.map((entry) => entry.path),
	];

	const home: CopyHome = {
		siteName: SITE_NAME,
		name: AUTHOR_NAME,
		description: DEFAULT_DESCRIPTION,
		about: ABOUT_PARAGRAPHS,
		featured: ordered
			.filter((project) => featured.has(project.slug))
			.slice(0, HOMEPAGE_LIMIT),
		topSkills: skillList
			.filter((skill) => top.has(skill.slug))
			.slice(0, HOMEPAGE_LIMIT),
		contact: [
			...CONTACT_LINKS.filter((link) => link.kind === "external").map(
				(link) => ({ label: link.label, value: link.href }),
			),
			...EMAILS.map((email) => ({
				label: `Email (${email.label.toLowerCase()})`,
				value: email.address,
			})),
		],
		cvPath: CV_PATH,
		pagePaths: paths,
	};

	const pages: PageEntry[] = [
		{
			path: "/",
			title: "Home",
			description: DEFAULT_DESCRIPTION,
			build: (origin) => homeCopy(home, origin),
		},
		{
			path: "/projects",
			title: "Projects",
			description: PROJECTS_DESCRIPTION,
			build: (origin) =>
				projectsCopy(
					ordered.map((project, index) => ({
						...project,
						number: padIndex(index + 1),
						featured: featured.has(project.slug),
					})),
					PROJECTS_DESCRIPTION,
					origin,
				),
		},
		{
			path: "/skills",
			title: "Skills",
			description: SKILLS_DESCRIPTION,
			build: (origin) =>
				skillsCopy(
					skillList.map((skill) => ({ ...skill, top: top.has(skill.slug) })),
					SKILLS_DESCRIPTION,
					origin,
				),
		},
		...projectEntries,
		...skillEntries,
	];
	return { pages, home };
}

function toCopy(entry: PageEntry, origin: string): AgentCopy {
	return {
		path: entry.path,
		file: agentCopyPath(entry.path),
		title: entry.title,
		description: entry.description,
		markdown: entry.build(origin),
	};
}

/** The agent copy of one human page, or undefined when the page has none. */
export function getAgentCopy(
	path: string,
	origin: string = getAgentOrigin(),
): AgentCopy | undefined {
	const entry = pageEntries().pages.find((page) => page.path === path);
	return entry ? toCopy(entry, origin) : undefined;
}

/** Every agent file the server routes answer: each copy, `llms.txt` and `sitemap.md`. */
export function getAgentFiles(origin: string = getAgentOrigin()): AgentFile[] {
	const { pages, home } = pageEntries();
	return [
		...pages.map((entry) => {
			const copy = toCopy(entry, origin);
			return { file: copy.file, text: copy.markdown };
		}),
		{ file: "/llms.txt", text: llmsTxt(home, pages, origin) },
		{ file: "/sitemap.md", text: sitemapMd(pages, SITE_NAME, origin) },
	];
}

/** One agent file by its path from the site root, or undefined when there is none. */
export function getAgentFile(
	file: string,
	origin: string = getAgentOrigin(),
): AgentFile | undefined {
	return getAgentFiles(origin).find((entry) => entry.file === file);
}
