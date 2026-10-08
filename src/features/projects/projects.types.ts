import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import type { Models } from "#/integrations/prisma/contract.d";

export type ProjectWithCoverImageUrl = Scalars<Models.public_Project> & {
	coverImageUrl?: string | null;
};
