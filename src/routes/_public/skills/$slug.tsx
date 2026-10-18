import { createFileRoute, notFound } from "@tanstack/react-router";
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
		return {
			meta: [
				{ title: `${page.name} · wends.dev` },
				{ name: "description", content: page.description },
			],
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { page } = Route.useLoaderData();
	// Keyed by slug so the skill filter resets on another skill.
	return <SkillPage key={page.slug} page={page} />;
}
