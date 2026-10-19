import { createFileRoute } from "@tanstack/react-router";
import SkillsPage from "#/features/skills/components/SkillsPage";
import { getSkillsPage } from "#/features/skills/skills.content";

export const Route = createFileRoute("/_public/skills/")({
	loader: async () => {
		return { skills: getSkillsPage() };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { skills } = Route.useLoaderData();
	return <SkillsPage skills={skills} />;
}
