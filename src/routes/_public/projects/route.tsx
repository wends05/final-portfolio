import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/projects")({
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
