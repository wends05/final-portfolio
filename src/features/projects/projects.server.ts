import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import { fetchImageWithKey } from "#/integrations/neon/storage/storage.server";
import type { Models } from "#/integrations/prisma/contract.d";
import { db } from "#/integrations/prisma/db";
import type { ProjectWithCoverImageUrl } from "./projects.types";

export interface GetProjectsOptions {
	take: number;
	skip: number;
}

async function getProjectsCoverImageUrls(
	projects: Scalars<Models.public_Project>[],
): Promise<ProjectWithCoverImageUrl[]> {
	const projectsWithImages = await Promise.all(
		projects.map(async (project) => {
			const coverImageUrl = await fetchImageWithKey(
				project.coverImageKey ?? undefined,
			);
			return {
				...project,
				coverImageUrl,
			};
		}),
	);
	return projectsWithImages;
}

export async function getFeaturedProjects({ limit = 3 }: { limit?: number }) {
	const projects = await db.orm.public.Project.where({ published: true })
		.where((p) => p.featuredRank.isNotNull())
		.orderBy((p) => p.featuredRank.asc())
		.limit(limit)
		.all();

	const projectsWithImages = await getProjectsCoverImageUrls(projects);
	return projectsWithImages;
}

export async function getProjects({ take, skip }: GetProjectsOptions) {
	const projects = await db.orm.public.Project.where({ published: true })
		.orderBy((p) => p.createdAt.desc())
		.offset(skip)
		.limit(take)
		.all();

	const projectsWithImages = await getProjectsCoverImageUrls(projects);
	return projectsWithImages;
}

export async function getProjectBySlug(slug: string) {
	const project = await db.orm.public.Project.first({ slug, published: true });
	return project;
}
