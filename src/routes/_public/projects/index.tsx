import { createFileRoute } from "@tanstack/react-router";
import ProjectsPage from "#/features/projects/components/ProjectsPage";
import { getProjectsPageFn } from "#/features/projects/projects.functions";

const DESCRIPTION =
	"Apps, games and experiments by Wendell Terence Dador, featured projects first.";

export const Route = createFileRoute("/_public/projects/")({
	loader: async () => {
		const projects = await getProjectsPageFn();
		// In development, show the mocks until real projects are published. The
		// dynamic import keeps them out of the production bundle.
		if (import.meta.env.DEV && projects.length === 0) {
			const { MOCK_INDEX_PROJECTS } = await import(
				"#/features/projects/utils/project-mocks"
			);
			return { projects: MOCK_INDEX_PROJECTS };
		}
		return { projects };
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
	const { projects } = Route.useLoaderData();
	return <ProjectsPage projects={projects} />;
}
