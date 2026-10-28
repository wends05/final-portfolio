import { createFileRoute, notFound } from "@tanstack/react-router";
import ProjectCaseStudy from "#/features/projects/components/ProjectCaseStudy";
import { getProjectPage } from "#/features/projects/projects.content";
import {
	buildSeo,
	projectJsonLd,
	truncateDescription,
} from "#/features/seo/seo.utils";

export const Route = createFileRoute("/_public/projects/$slug")({
	loader: async ({ params }) => {
		const page = getProjectPage(params.slug);
		if (!page) throw notFound();
		return { page };
	},
	head: ({ loaderData }) => {
		const project = loaderData?.page.project;
		if (!project) return {};
		return buildSeo({
			title: project.title,
			description: truncateDescription(project.description),
			path: `/projects/${project.slug}`,
			image: project.cover
				? { ...project.cover, alt: `${project.title} cover` }
				: null,
			type: "article",
			jsonLd: projectJsonLd(project),
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { page } = Route.useLoaderData();
	return <ProjectCaseStudy page={page} />;
}
