import { createFileRoute } from "@tanstack/react-router";
import { agentFileResponse } from "#/features/agent/agent.server";

// An agent file (ADR 0021), served by the app rather than from public/.
export const Route = createFileRoute("/projects/{$slug}.md")({
	server: {
		handlers: {
			GET: ({ params }) => agentFileResponse(`/projects/${params.slug}.md`),
		},
	},
});
