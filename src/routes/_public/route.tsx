import { createFileRoute, redirect } from "@tanstack/react-router";
import RootLayout from "#/features/public/components/RootLayout";
import RouteErrorPage from "#/features/site/components/RouteErrorPage";
import { getSiteGate } from "#/features/site/site.functions";

export const Route = createFileRoute("/_public")({
	beforeLoad: async () => {
		const { gated } = await getSiteGate();

		if (gated) throw redirect({ to: "/coming-soon" });
	},
	component: RootLayout,
	// An error in the layout itself (the gate check) replaces the layout, so
	// the page draws its own wordmark. Child errors render inside the layout.
	errorComponent: (props) => <RouteErrorPage {...props} standalone />,
});
