import type { Project, Skill, Tool } from "#content";

/** A homepage skill. */
export type LandingSkill = Pick<Skill, "name" | "slug" | "tools">;

/** A /skills item. */
export type SkillOverview = Pick<
	Skill,
	"name" | "confidence" | "slug" | "tools"
>;

/** A project on a skill page, keeping only that skill's tools. */
export type SkillProject = Pick<
	Project,
	"slug" | "title" | "cover" | "status"
> & {
	tools: Tool[];
	/** The project's number in the /projects order, as two digits. */
	number: string;
	year: string;
};

/** Everything /skills/<slug> shows. */
export type SkillPageData = Pick<
	Skill,
	"slug" | "name" | "confidence" | "tools" | "overview" | "description"
> & {
	/** Listed in site.yaml's topSkills. */
	isTop: boolean;
	projects: SkillProject[];
};
