import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/projects/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/projects"!</div>;
}
