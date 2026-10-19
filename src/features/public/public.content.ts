import type { LandingProject } from "#/features/projects/projects.types";
import type { LandingSkill } from "#/features/skills/skills.types";
import { projects, site, skills } from "#content";

/** max number of projects/skills to display on the homepage */
export const HOMEPAGE_LIMIT = 3;

export function getHomepage() {
	const featuredProjects = site.featured
		.flatMap((slug) => projects.find((p) => p.slug === slug) ?? [])
		.map<LandingProject>((p) => ({
			slug: p.slug,
			title: p.title,
			description: p.description,
			cover: p.cover,
			tools: p.tools,
			githubUrl: p.githubUrl,
			liveUrl: p.liveUrl,
			status: p.status,
			startedAt: p.startedAt,
			endedAt: p.endedAt,
			teamName: p.teamName,
		}));
	const featuredSkills = site.topSkills
		.flatMap((slug) => skills.find((s) => s.slug === slug) ?? [])
		.map<LandingSkill>((s) => ({
			slug: s.slug,
			name: s.name,
			tools: s.tools,
		}));
	return {
		featuredProjects: featuredProjects.slice(0, HOMEPAGE_LIMIT),
		topSkills: featuredSkills.slice(0, HOMEPAGE_LIMIT),
	};
}
