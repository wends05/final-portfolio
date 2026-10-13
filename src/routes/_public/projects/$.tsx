import { createFileRoute, notFound } from "@tanstack/react-router";
import ProjectCaseStudy from "#/features/projects/components/ProjectCaseStudy";
import { getProjectPageFn } from "#/features/projects/projects.functions";

export const Route = createFileRoute("/_public/projects/$")({
	loader: async ({ params }) => {
		const slug = params._splat ?? "";
		if (!slug) throw notFound();
		// Unknown and unpublished slugs both 404, so drafts stay hidden.
		let page = await getProjectPageFn({ data: { slug } });
		// In development, mock slugs resolve until real projects are published.
		// The dynamic import keeps the mocks out of the production bundle.
		if (import.meta.env.DEV && !page) {
			const { getMockProjectPage } = await import(
				"#/features/projects/utils/project-mocks"
			);
			page = getMockProjectPage(slug);
		}
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
				...(project.coverImageUrl
					? [{ property: "og:image", content: project.coverImageUrl }]
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
