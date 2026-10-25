import { projects, skills } from "#content";

/**
 * Every public path that goes in the sitemap. Drafts are left out even when
 * drafts are switched on, so a preview never advertises them.
 */
export function getSitemapPaths(): string[] {
	return [
		"/",
		"/projects",
		"/skills",
		...projects.filter((p) => !p.draft).map((p) => `/projects/${p.slug}`),
		...skills.filter((s) => !s.draft).map((s) => `/skills/${s.slug}`),
	];
}
