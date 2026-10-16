import { createFileRoute, notFound } from "@tanstack/react-router";
import SkillCategoryPage from "#/features/skills/components/SkillCategoryPage";

export const Route = createFileRoute("/_public/skills/$slug")({
	loader: async ({ params }) => {
		// TODO: load the category from the database once its query exists. Until
		// then development shows the mocks, and production has no such page. The
		// dynamic import keeps the mocks out of the production bundle.
		if (!import.meta.env.DEV) throw notFound();
		const { getMockSkillCategoryPage } = await import(
			"#/features/skills/utils/skills-mocks"
		);
		const page = getMockSkillCategoryPage(params.slug);
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
	// Keyed by slug so the skill filter resets on another category.
	return <SkillCategoryPage key={page.slug} page={page} />;
}
