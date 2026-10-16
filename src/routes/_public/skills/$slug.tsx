import { createFileRoute, notFound } from "@tanstack/react-router";
import SkillPage from "#/features/skills/components/SkillPage";
import { getSkillPageFn } from "#/features/skills/skills.functions";

export const Route = createFileRoute("/_public/skills/$slug")({
	loader: async ({ params }) => {
		let page = await getSkillPageFn({ data: { slug: params.slug } });
		// In development, show the mocks until real skills are published. The
		// dynamic import keeps them out of the production bundle.
		if (!page && import.meta.env.DEV) {
			const { getMockSkillPage } = await import(
				"#/features/skills/utils/skills-mocks"
			);
			page = getMockSkillPage(params.slug);
		}
		if (!page) throw notFound();
		return { page };
	},
	head: ({ loaderData }) => {
		const page = loaderData?.page;
		if (!page) return {};
		return {
			meta: [
				{ title: `${page.name} · wends.dev` },
				{ name: "description", content: page.overview },
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
