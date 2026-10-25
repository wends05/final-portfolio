import { createFileRoute } from "@tanstack/react-router";
import { buildSeo } from "#/features/seo/seo.utils";
import SkillsPage from "#/features/skills/components/SkillsPage";
import { getSkillsPage } from "#/features/skills/skills.content";

const DESCRIPTION =
	"The skills and tools Wendell Terence Dador works with, and the projects behind each one.";

export const Route = createFileRoute("/_public/skills/")({
	loader: async () => {
		return { skills: getSkillsPage() };
	},
	head: () =>
		buildSeo({ title: "skills", description: DESCRIPTION, path: "/skills" }),
	component: RouteComponent,
});

function RouteComponent() {
	const { skills } = Route.useLoaderData();
	return <SkillsPage skills={skills} />;
}
