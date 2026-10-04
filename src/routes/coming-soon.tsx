import { createFileRoute, redirect } from "@tanstack/react-router";
import ComingSoonPage from "#/features/public/components/ComingSoonPage";
import { getSiteGate } from "#/features/site/site.functions";

export const Route = createFileRoute("/coming-soon")({
	beforeLoad: async () => {
		const { gated } = await getSiteGate();

		if (!gated) throw redirect({ to: "/" });
	},
	head: () => ({
		meta: [
			{
				name: "robots",
				content: "noindex",
			},
		],
	}),
	component: ComingSoonPage,
});
