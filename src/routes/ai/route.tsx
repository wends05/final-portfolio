import { createFileRoute, redirect } from "@tanstack/react-router";
import AgentLayout from "#/features/agent/components/AgentLayout";
import RouteErrorPage from "#/features/site/components/RouteErrorPage";
import { getSiteGate } from "#/features/site/site.functions";

// The agent views (ADR 0021): their own plain layout, behind the same gate
// as the public pages.
export const Route = createFileRoute("/ai")({
	beforeLoad: async () => {
		const { gated } = await getSiteGate();

		if (gated) throw redirect({ to: "/coming-soon" });
	},
	component: AgentLayout,
	errorComponent: (props) => <RouteErrorPage {...props} standalone />,
});
