import {
	getProjectYear,
	orderProjects,
	padIndex,
} from "#/features/projects/projects.utils";
import { projects, site, skills } from "#content";
import type { SkillOverview, SkillPageData } from "./skills.types";
import {
	getProjectsUsingTools,
	getSkillPosition,
	orderSkillsPage,
} from "./skills.utils";

/** The /skills page description, also in its agent copy. */
export const SKILLS_DESCRIPTION =
	"The skills and tools Wendell Terence Dador works with, and the projects behind each one.";

/** Every skill for /skills: top skills first, then by confidence. */
export function getSkillsPage(): SkillOverview[] {
	// Only the fields the list shows, so overview HTML stays out of the page data.
	return orderSkillsPage(skills, site.topSkills).map(
		({ slug, name, confidence, tools }) => ({ slug, name, confidence, tools }),
	);
}

/**
 * /skills/<slug>: the skill and the projects that used any of its tools, in
 * the /projects order. Undefined when no skill has the slug.
 */
export function getSkillPage(slug: string): SkillPageData | undefined {
	const skill = skills.find((s) => s.slug === slug);
	if (!skill) return undefined;
	const ordered = orderProjects(projects, site.featured);
	return {
		slug: skill.slug,
		name: skill.name,
		confidence: skill.confidence,
		tools: skill.tools,
		overview: skill.overview,
		description: skill.description,
		isTop: getSkillPosition(skill.slug, site.topSkills) !== -1,
		// Only what a card needs, so project bodies stay out of the page data.
		projects: getProjectsUsingTools(ordered, skill.tools).map(
			({ slug, title, cover, status, startedAt, tools }) => ({
				slug,
				title,
				cover,
				status,
				tools,
				number: padIndex(ordered.findIndex((p) => p.slug === slug) + 1),
				year: getProjectYear(startedAt),
			}),
		),
	};
}
