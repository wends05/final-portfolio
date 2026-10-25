import { createFileRoute, notFound } from "@tanstack/react-router";
import { buildSeo, truncateDescription } from "#/features/seo/seo.utils";
import SkillPage from "#/features/skills/components/SkillPage";
import { getSkillPage } from "#/features/skills/skills.content";

export const Route = createFileRoute("/_public/skills/$slug")({
	loader: ({ params }) => {
		const page = getSkillPage(params.slug);
		if (!page) throw notFound();
		return { page };
	},
	head: ({ loaderData }) => {
		const page = loaderData?.page;
		if (!page) return {};
		return buildSeo({
			title: page.name,
			description: truncateDescription(page.description),
			path: `/skills/${page.slug}`,
		});
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { page } = Route.useLoaderData();
	// Keyed by slug so the skill filter resets on another skill.
	return <SkillPage key={page.slug} page={page} />;
}
