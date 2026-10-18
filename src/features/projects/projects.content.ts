import { collaborators, type Project, projects, site } from "#content";
import type { ProjectPageData } from "./projects.types";
import {
	getProjectPosition,
	orderProjects,
	resolveCredits,
} from "./projects.utils";

export function getProjectsPage(): { projects: Project[]; featured: string[] } {
	return {
		projects: orderProjects(projects, site.featured),
		featured: site.featured,
	};
}

export function getProjectPage(slug: string): ProjectPageData | undefined {
	// 1. ordered = orderProjects(projects, site.featured)
	// 2. place = getProjectPosition(ordered, slug) — already exists, reuse it
	// 3. null when place is null
	// 4. return { project, credits: resolveCredits(...), ...place }

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
