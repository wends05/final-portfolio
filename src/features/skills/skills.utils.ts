import { toolKey } from "#/lib/content.checks";
import type { Tool } from "#content";

/**
 * The first `count` tools to list by name, and how many are left over for
 * the "+N" after them.
 */
export function splitVisibleTools<T>(tools: T[], count: number) {
	const visible = tools.slice(0, Math.max(count, 0));
	return { visible, hidden: tools.length - visible.length };
}

/**
 * The projects that used `tool` (matched ignoring case), or all of them when
 * no tool is selected.
 */
export function filterProjectsByTool<T extends { tools: Tool[] }>(
	projects: T[],
	tool: string | null,
) {
	if (tool === null) return projects;
	const key = toolKey(tool);
	return projects.filter((project) =>
		project.tools.some((t) => toolKey(t) === key),
	);
}

/**
 * The projects that used any of the skill's tools (matched ignoring case),
 * each keeping only those tools. Projects that used none of them are dropped.
 */
export function getProjectsUsingTools<T extends { tools: Tool[] }>(
	projects: T[],
	skillTools: Tool[],
): T[] {
	const keys = new Set(skillTools.map(toolKey));
	return projects.flatMap((project) => {
		const tools = project.tools.filter((tool) => keys.has(toolKey(tool)));
		return tools.length === 0 ? [] : [{ ...project, tools }];
	});
}

/**
 * The item a pick landed on, found by its `data-slug`, and the rest of the
 * list, which fades while the picked title washes.
 */
export function splitPicked<T extends { dataset: DOMStringMap }>(
	items: T[],
	slug: string,
) {
	const picked = items.find((item) => item.dataset.slug === slug);
	return { picked, rest: items.filter((item) => item !== picked) };
}

/** Index of `slug` in `topSkills`, from 0, or -1 when it isn't a top skill. */
export function getSkillPosition(slug: string, topSkills: string[]): number {
	return topSkills.indexOf(slug);
}

/**
 * Top skills in `topSkills` order, then the rest by confidence, highest first,
 * then by slug. Returns a new array.
 */
export function orderSkillsPage<
	T extends { slug: string; confidence: number; name: string },
>(items: T[], topSkills: string[]) {
	const topSkillMap = new Map(topSkills.map((slug, i) => [slug, i]));
	return [...items]
		.sort((a, b) => {
			const aTop = topSkillMap.get(a.slug) ?? Number.POSITIVE_INFINITY;
			const bTop = topSkillMap.get(b.slug) ?? Number.POSITIVE_INFINITY;
			if (aTop !== bTop) return aTop - bTop; // top skills first, in site.yaml order
			if (a.confidence !== b.confidence) return b.confidence - a.confidence; // then by confidence
			return a.slug.localeCompare(b.slug);
		})
		.map((p, i) => ({
			...p,
			position: i,
		}));
}
