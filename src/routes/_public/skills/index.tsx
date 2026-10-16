import { createFileRoute } from "@tanstack/react-router";
import SkillsPage from "#/features/skills/components/SkillsPage";
import { getSkillsPageFn } from "#/features/skills/skills.functions";

export const Route = createFileRoute("/_public/skills/")({
	loader: async () => {
		const skills = await getSkillsPageFn();
		// In development, show the mocks until real skills are published. The
		// dynamic import keeps them out of the production bundle.
		if (import.meta.env.DEV && skills.length === 0) {
			const { MOCK_SKILLS } = await import(
				"#/features/skills/utils/skills-mocks"
			);
			return { skills: MOCK_SKILLS };
		}
		return { skills };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { skills } = Route.useLoaderData();
	return <SkillsPage skills={skills} />;
}
