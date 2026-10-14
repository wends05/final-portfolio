import type { Scalars } from "@prisma/orm-postgres/family-contract/types";
import { fetchImageWithKey } from "#/integrations/neon/storage/storage.server";
import type { Models } from "#/integrations/prisma/contract.d";
import { db } from "#/integrations/prisma/db";
import type {
	ProjectPageData,
	ProjectSummary,
	ProjectWithCoverImageUrl,
} from "./projects.types";
import { getProjectPosition, orderProjectsForIndex } from "./projects.utils";

export interface GetProjectsOptions {
	take: number;
	skip: number;
}

async function getProjectsCoverImageUrls<
	T extends Scalars<Models.public_Project>,
>(projects: T[]): Promise<(T & ProjectWithCoverImageUrl)[]> {
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
		.include("skills", (skill) => skill.select("name"))
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

/** Every published project with its skills, in the /projects order. */
export async function getAllProjects(): Promise<ProjectSummary[]> {
	const projects = await db.orm.public.Project.where({ published: true })
		.include("skills", (skill) => skill.select("name"))
		.all();
	const projectsWithImages = await getProjectsCoverImageUrls(projects);
	return orderProjectsForIndex(projectsWithImages);
}

/**
 * A published project's case study: the project with its skills and cover,
 * its gallery, its credits, and its place in the /projects order.
 * Null when no published project has the slug.
 */
export async function getProjectPage(
	slug: string,
): Promise<ProjectPageData | null> {
	const [project, listed] = await Promise.all([
		db.orm.public.Project.where({ slug, published: true })
			.include("skills", (skill) => skill.select("name"))
			.include("images", (image) =>
				image.select("key", "alt").orderBy((i) => i.order.asc()),
			)
			.include("collaborators", (credit) =>
				credit
					.select("role")
					.include("collaborator", (person) =>
						person.select("name", "profileUrl"),
					),
			)
			.first(),
		db.orm.public.Project.where({ published: true })
			.select("slug", "title", "featuredRank", "createdAt")
			.all(),
	]);
	if (!project) return null;

	const place = getProjectPosition(orderProjectsForIndex(listed), slug);
	if (!place) return null;

	const { skills, images, collaborators, ...scalars } = project;
	const [coverImageUrl, galleryUrls] = await Promise.all([
		fetchImageWithKey(scalars.coverImageKey ?? undefined),
		Promise.all(images.map((image) => fetchImageWithKey(image.key))),
	]);

	const gallery = images.flatMap((image, i) => {
		const url = galleryUrls[i];
		return url ? [{ url, alt: image.alt }] : [];
	});

	return {
		project: {
			...scalars,
			coverImageUrl,
			skills,
		},
		gallery,
		credits: collaborators.flatMap(({ role, collaborator }) =>
			collaborator
				? [
						{
							name: collaborator.name,
							role: role ?? null,
							profileUrl: collaborator.profileUrl ?? null,
						},
					]
				: [],
		),
		...place,
	};
}
