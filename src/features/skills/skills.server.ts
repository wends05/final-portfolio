import { orderProjectsForIndex } from "#/features/projects/projects.utils";
import { db } from "#/integrations/prisma/db";
import type {
	LandingSkill,
	SkillPageData,
	SkillsPageSkill,
} from "./skills.types";
import { getProjectsUsingTools } from "./skills.utils";

export async function getTopSkills({
	limit = 3,
}: {
	limit?: number;
}): Promise<LandingSkill[]> {
	const topSkills = await db.orm.public.Skill.where((c) =>
		c.topRank.isNotNull(),
	)
		.orderBy((c) => c.topRank.asc())
		.limit(limit)
		.include("tools", (s) => s.select("name", "id"))
		.all();
	return topSkills;
}

export async function getAllSkills(): Promise<SkillsPageSkill[]> {
	const skills = await db.orm.public.Skill.orderBy((sk) => sk.topRank.asc())
		.include("tools", (s) => s.select("name", "id"))
		.all();
	return skills;
}

/**
 * /skills/<slug>: the skill with its tools (by name) and the published
 * projects that used any of them, in the /projects order, each with only this
 * skill's tools. Null when no skill has the slug.
 */
export async function getSkillPage(
	slug: string,
): Promise<SkillPageData | null> {
	const skill = await db.orm.public.Skill.where({ slug })
		.include("tools", (tool) =>
			tool.select("id", "name").orderBy((t) => t.name.asc()),
		)
		.first();
	if (!skill) return null;

	const toolIds = new Set(skill.tools.map((tool) => tool.id));
	const published = await db.orm.public.Project.where({ published: true })
		.include("tools", (tool) => tool.select("id", "name"))
		.all();
	const projects = orderProjectsForIndex(
		getProjectsUsingTools(published, toolIds),
	).map(({ id, slug, title, tools }) => ({ id, slug, title, tools }));

	const { id, name, overview, confidence, topRank, tools } = skill;
	return {
		id,
		slug: skill.slug,
		name,
		overview,
		confidence,
		topRank,
		tools,
		projects,
	};
}
