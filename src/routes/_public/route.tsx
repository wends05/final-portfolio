import { createFileRoute, redirect } from "@tanstack/react-router";
import RootLayout from "#/features/public/components/RootLayout";
import { getSiteGate } from "#/features/site/site.functions";

export const Route = createFileRoute("/_public")({
	beforeLoad: async () => {
		const { gated } = await getSiteGate();

		if (gated) throw redirect({ to: "/coming-soon" });
	},
	component: RootLayout,
});
