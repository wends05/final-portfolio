import { createFileRoute, notFound } from "@tanstack/react-router";
import ProjectCaseStudy from "#/features/projects/components/ProjectCaseStudy";
import { getProjectPage } from "#/features/projects/projects.content";

export const Route = createFileRoute("/_public/projects/$slug")({
	loader: async ({ params }) => {
		const page = getProjectPage(params.slug);
		if (!page) throw notFound();
		return { page };
	},
	head: ({ loaderData }) => {
		const project = loaderData?.page.project;
		if (!project) return {};
		return {
			meta: [
				{ title: `${project.title} · wends.dev` },
				{ name: "description", content: project.description },
				{ property: "og:title", content: project.title },
				{ property: "og:description", content: project.description },
				...(project.cover
					? [{ property: "og:image", content: project.cover.src }]
					: []),
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { page } = Route.useLoaderData();
	return <ProjectCaseStudy page={page} />;
}
