import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import type { Models } from "#/integrations/prisma/contract.d";

export type ProjectWithCoverImageUrl = Scalars<Models.public_Project> & {
	coverImageUrl?: string | null;
};

/** A project as lists show it: its scalars, cover image URL, and the names of the skills it used. */
export type ProjectSummary = ProjectWithCoverImageUrl & {
	skills: { name: string }[];
};

/** A homepage project. */
export type FeaturedProject = ProjectSummary;

export interface ProjectLinkTarget {
	slug: string;
	title: string;
}

export interface ProjectImageView {
	url: string;
	alt: string;
}

export interface ProjectCredit {
	name: string;
	role: string | null;
	profileUrl: string | null;
}

/** Everything the case-study page shows. The cover is `project.coverImageUrl`. */
export interface ProjectPageData {
	project: ProjectSummary;
	/** The `ProjectImage` rows in their set order; the cover is not one of them. */
	gallery: ProjectImageView[];
	credits: ProjectCredit[];
	/** Where the project sits in the /projects order, from 1: the margin number. */
	position: number;
	total: number;
	/** The project after it in the /projects order, or null when it is the only one. */
	next: ProjectLinkTarget | null;
}
