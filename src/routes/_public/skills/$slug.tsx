import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/skills/$slug")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/skills/$slug"!</div>;
}
