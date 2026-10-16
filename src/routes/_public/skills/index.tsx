import { createFileRoute } from "@tanstack/react-router";
import SkillsPage from "#/features/skills/components/SkillsPage";
import { getSkillsPageFn } from "#/features/skills/skills.functions";

export const Route = createFileRoute("/_public/skills/")({
	loader: async () => {
		const skillCategories = await getSkillsPageFn();
		// In development, show the mocks until real skills are published. The
		// dynamic import keeps them out of the production bundle.
		if (import.meta.env.DEV && skillCategories.length === 0) {
			const { MOCK_SKILL_CATEGORIES } = await import(
				"#/features/skills/utils/skills-mocks"
			);
			return { skillCategories: MOCK_SKILL_CATEGORIES };
		}
		return { skillCategories };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { skillCategories } = Route.useLoaderData();
	return <SkillsPage skillCategories={skillCategories} />;
}
