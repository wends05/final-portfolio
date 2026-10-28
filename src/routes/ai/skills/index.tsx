import { createFileRoute, notFound } from "@tanstack/react-router";
import { getAgentCopy, getAgentOrigin } from "#/features/agent/agent.content";
import { agentViewHead } from "#/features/agent/agent.utils";
import AgentPage from "#/features/agent/components/AgentPage";

export const Route = createFileRoute("/ai/skills/")({
	loader: () => {
		const copy = getAgentCopy("/skills");
		if (!copy) throw notFound();
		return { copy, origin: getAgentOrigin() };
	},
	head: ({ loaderData }) => (loaderData ? agentViewHead(loaderData.copy) : {}),
	component: RouteComponent,
});

function RouteComponent() {
	const { copy, origin } = Route.useLoaderData();
	return <AgentPage copy={copy} origin={origin} />;
}
