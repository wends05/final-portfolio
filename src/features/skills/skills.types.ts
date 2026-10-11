import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import type { Models } from "#/integrations/prisma/contract.d";

export type Skill = Scalars<Models.public_Skill>;

export type SkillPreview = Pick<Skill, "id" | "name">;

export type SkillCategory = Scalars<Models.public_SkillCategory>;

export type LandingSkillCategory = SkillCategory & {
	skills: SkillPreview[];
};
