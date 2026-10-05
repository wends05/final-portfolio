import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/skills")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/_public/skills"!</div>;
}
