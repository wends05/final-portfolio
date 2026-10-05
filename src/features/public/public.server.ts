import { getFeaturedProjects } from "#/features/projects/projects.server";
import { getTopSkills } from "#/features/skills/skills.server";

export const HOMEPAGE_FEATURED_LIMIT = 3;

/** Featured projects and top skill categories for the homepage, loaded in parallel. */
export async function getHomepageData() {
	const [projects, skills] = await Promise.all([
		getFeaturedProjects({ limit: HOMEPAGE_FEATURED_LIMIT }),
		getTopSkills({ limit: HOMEPAGE_FEATURED_LIMIT }),
	]);
	return { projects, skills };
}
