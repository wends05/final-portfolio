import { db } from "#/integrations/prisma/db";

interface TopSkillsProps {
	limit: number;
}

export async function getTopSkills({ limit = 3 }: TopSkillsProps) {
	const topSkills = await db.orm.public.SkillCategory.where((c) =>
		c.topRank.isNotNull(),
	)
		.orderBy((c) => c.topRank.asc())
		.limit(limit)
		.all();
	return topSkills;
}
