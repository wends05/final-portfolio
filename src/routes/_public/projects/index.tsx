import { createFileRoute } from "@tanstack/react-router";
import ProjectsPage from "#/features/projects/components/ProjectsPage";
import { getProjectsPage } from "#/features/projects/projects.content";

const DESCRIPTION =
	"Apps, games and experiments by Wendell Terence Dador, featured projects first.";

export const Route = createFileRoute("/_public/projects/")({
	loader: async () => {
		const page = getProjectsPage();

		if (!page) {
			throw new Error("No project found");
		}

		return page;
	},
	head: () => ({
		meta: [
			{ title: "projects · wends.dev" },
			{ name: "description", content: DESCRIPTION },
		],
	}),
	component: RouteComponent,
});

function RouteComponent() {
	const page = Route.useLoaderData();
	return <ProjectsPage {...page} />;
}
