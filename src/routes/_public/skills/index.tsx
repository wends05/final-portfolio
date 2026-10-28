import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "#/features/seo/seo.utils";
import SkillsPage from "#/features/skills/components/SkillsPage";
import {
	getSkillsPage,
	SKILLS_DESCRIPTION,
} from "#/features/skills/skills.content";

export const Route = createFileRoute("/_public/skills/")({
	loader: async () => {
		return { skills: getSkillsPage() };
	},
	head: () =>
		buildSeo({
			title: "skills",
			description: SKILLS_DESCRIPTION,
			path: "/skills",
		}),
	component: RouteComponent,
});

function RouteComponent() {
	const { skills } = Route.useLoaderData();
	return <SkillsPage skills={skills} />;
}
