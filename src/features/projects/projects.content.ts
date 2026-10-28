import { collaborators, type Project, projects, site } from "#content";
import type { ProjectPageData } from "./projects.types";
import {
	getProjectPosition,
	orderProjects,
	resolveCredits,
} from "./projects.utils";

/** The /projects page description, also in its agent copy. */
export const PROJECTS_DESCRIPTION =
	"Apps, games and experiments by Wendell Terence Dador, featured projects first.";

export function getProjectsPage(): { projects: Project[]; featured: string[] } {
	return {
		projects: orderProjects(projects, site.featured),
		featured: site.featured,
	};
}

export function getProjectPage(slug: string): ProjectPageData | undefined {
	const ordered = orderProjects(projects, site.featured);
	const place = getProjectPosition(ordered, slug);
	if (place === null) return undefined;
	const project = ordered.find((p) => p.slug === slug);
	if (project === undefined) return undefined;
	return {
		isFeatured: site.featured.includes(slug),
		project,
		...place,
		credits: resolveCredits(project.credits, collaborators),
	};
}
