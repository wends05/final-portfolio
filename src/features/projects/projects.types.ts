import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import type { Models } from "#/integrations/prisma/contract.d";

export type ProjectWithCoverImageUrl = Scalars<Models.public_Project> & {
	coverImageUrl?: string | null;
};

/** A homepage project: its scalars, cover image URL, and the names of the skills it used. */
export type FeaturedProject = ProjectWithCoverImageUrl & {
	skills: { name: string }[];
};
