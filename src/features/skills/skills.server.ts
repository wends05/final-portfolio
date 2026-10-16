import { db } from "#/integrations/prisma/db";
import type {
	LandingSkillCategory,
	SkillsPageSkillCategory,
} from "./skills.types";

export async function getTopSkillCategories({
	limit = 3,
}: {
	limit?: number;
}): Promise<LandingSkillCategory[]> {
	const topSkills = await db.orm.public.SkillCategory.where((c) =>
		c.topRank.isNotNull(),
	)
		.orderBy((c) => c.topRank.asc())
		.limit(limit)
		.include("skills", (s) => s.select("name", "id"))
		.all();
	return topSkills;
}

export async function getAllSkillCategories(): Promise<
	SkillsPageSkillCategory[]
> {
	const skillCategories = await db.orm.public.SkillCategory.orderBy((sk) =>
		sk.topRank.asc(),
	)
		.include("skills", (s) => s.select("name", "id"))
		.all();
	return skillCategories;
}
