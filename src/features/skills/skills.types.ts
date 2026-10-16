import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import type { Models } from "#/integrations/prisma/contract.d";

export type Skill = Scalars<Models.public_Skill>;

export type SkillPreview = Pick<Skill, "id" | "name">;

export type SkillCategory = Scalars<Models.public_SkillCategory>;

export type LandingSkillCategory = SkillCategory & {
	skills: SkillPreview[];
};

export type SkillsPageSkillCategory = Pick<
	SkillCategory,
	"id" | "name" | "confidence" | "slug"
> & {
	skills: SkillPreview[];
};

/** A project on a skill category page, with only that category's skills. */
export type SkillCategoryProject = Pick<
	Scalars<Models.public_Project>,
	"id" | "slug" | "title"
> & {
	skills: SkillPreview[];
};

/** Everything /skills/<slug> shows. */
export type SkillCategoryPageData = Pick<
	SkillCategory,
	"id" | "slug" | "name" | "overview" | "confidence" | "topRank"
> & {
	skills: SkillPreview[];
	projects: SkillCategoryProject[];
};
