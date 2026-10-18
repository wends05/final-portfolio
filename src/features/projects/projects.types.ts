import type { Project } from "#content";

export type LandingProject = Pick<
	Project,
	| "slug"
	| "title"
	| "description"
	| "cover"
	| "tools"
	| "githubUrl"
	| "liveUrl"
	| "status"
	| "startedAt"
	| "endedAt"
	| "teamName"
>;
export interface ProjectLinkTarget {
	slug: string;
	title: string;
}

export type ProjectImageView = Project["gallery"][number];

export interface ProjectCredit {
	name: string;
	role: string | null;
	profileUrl: string | null;
}

/** Everything the case-study page shows. The cover is `project.cover`. */
export interface ProjectPageData {
	project: Project;
	credits: ProjectCredit[];
	/** Where the project sits in the /projects order, from 1: the margin number. */
	position: number;
	total: number;
	/** The project after it in the /projects order, or null when it is the only one. */
	next: ProjectLinkTarget | null;
	isFeatured: boolean;
}
