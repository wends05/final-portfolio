import { db } from "#/integrations/prisma/db";

export interface GetProjectsOptions {
	take: number;
	skip: number;
}

export async function getFeaturedProjects({ limit = 3 }: { limit?: number }) {
	const projects = await db.orm.public.Project.where({ published: true })
		.where((p) => p.featuredRank.isNotNull())
		.orderBy((p) => p.featuredRank.asc())
		.limit(limit)
		.all();
	return projects;
}

export async function getProjects({ take, skip }: GetProjectsOptions) {
	const projects = await db.orm.public.Project.where({ published: true })
		.orderBy((p) => p.createdAt.desc())
		.offset(skip)
		.limit(take)
		.all();
	return projects;
}

export async function getProjectBySlug(slug: string) {
	const project = await db.orm.public.Project.first({ slug, published: true });
	return project;
}
