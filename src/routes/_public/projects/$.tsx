import { createFileRoute, notFound } from "@tanstack/react-router";
import { getProjectBySlugFn } from "#/features/projects/projects.functions";

export const Route = createFileRoute("/_public/projects/$")({
	loader: async ({ params }) => {
		const slug = params._splat ?? "";
		// Unknown and unpublished slugs both 404, so drafts stay hidden.
		const project = slug ? await getProjectBySlugFn({ data: { slug } }) : null;
		if (!project) throw notFound();
		return { project };
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/projects/$"!</div>;
}
