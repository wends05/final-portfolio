import type { ProjectCredit } from "#/features/projects/projects.types";
import type { Project, Skill } from "#content";

/** One agent copy: a page's Markdown, and where it lives. */
export interface AgentCopy {
	/** The human page: `/projects/<slug>`. */
	path: string;
	/** The file, from the site root: `/projects/<slug>.md`. */
	file: string;
	/** The page's name, for lists and the agent view's title. */
	title: string;
	description: string;
	markdown: string;
}

/** A file written into `public/` at build time: a copy, `llms.txt` or `sitemap.md`. */
export interface AgentFile {
	/** From the site root: `/projects/<slug>.md`. */
	file: string;
	text: string;
}

/** Everything a project's copy shows: the case study's facts and write-up. */
export type CopyProject = Pick<
	Project,
	| "slug"
	| "title"
	| "description"
	| "status"
	| "startedAt"
	| "tools"
	| "bodyMarkdown"
> & {
	endedAt: string | null;
	teamName: string | null;
	githubUrl: string | null;
	liveUrl: string | null;
	credits: ProjectCredit[];
	/** The case study's metadata rows, values already joined into text. */
	metadata: { label: string; value: string }[];
	featured: boolean;
};

/** One row of the `/projects` copy. */
export type CopyProjectRow = Pick<
	Project,
	"slug" | "title" | "description" | "status" | "startedAt" | "tools"
> & {
	/** The position in the /projects order, as two digits. */
	number: string;
	featured: boolean;
};

/** Everything a skill's copy shows: its facts, overview, and projects. */
export type CopySkill = Pick<
	Skill,
	"slug" | "name" | "confidence" | "tools" | "overviewMarkdown"
> & {
	top: boolean;
	projects: (Pick<Project, "slug" | "title" | "status"> & {
		number: string;
		year: string;
		tools: string[];
	})[];
};

/** One row of the `/skills` copy. */
export type CopySkillRow = Pick<
	Skill,
	"slug" | "name" | "confidence" | "tools"
> & { top: boolean };

/** Everything the home copy shows. */
export interface CopyHome {
	siteName: string;
	/** The owner's name: the home copy's title. */
	name: string;
	description: string;
	/** The homepage's "about" paragraphs. */
	about: readonly string[];
	featured: Pick<Project, "slug" | "title" | "description">[];
	topSkills: Pick<Skill, "slug" | "name" | "confidence" | "tools">[];
	/** Contact lines as shown: a profile URL or an email address. */
	contact: { label: string; value: string }[];
	cvPath: string;
	/** Every page with a copy, for the home copy's list of agent files. */
	pagePaths: string[];
}
