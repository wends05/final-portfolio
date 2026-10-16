import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import type { Models } from "#/integrations/prisma/contract.d";

export type Tool = Scalars<Models.public_Tool>;

export type ToolPreview = Pick<Tool, "id" | "name">;

export type Skill = Scalars<Models.public_Skill>;

export type LandingSkill = Skill & {
	tools: ToolPreview[];
};

export type SkillsPageSkill = Pick<
	Skill,
	"id" | "name" | "confidence" | "slug"
> & {
	tools: ToolPreview[];
};

/** A project on a skill page, with only that skill's tools. */
export type SkillProject = Pick<
	Scalars<Models.public_Project>,
	"id" | "slug" | "title"
> & {
	tools: ToolPreview[];
};

/** Everything /skills/<slug> shows. */
export type SkillPageData = Pick<
	Skill,
	"id" | "slug" | "name" | "overview" | "confidence" | "topRank"
> & {
	tools: ToolPreview[];
	projects: SkillProject[];
};
