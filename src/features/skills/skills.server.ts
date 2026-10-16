import { db } from "#/integrations/prisma/db";
import type { LandingSkill, SkillsPageSkill } from "./skills.types";

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
