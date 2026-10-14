import { createFileRoute, notFound } from "@tanstack/react-router";

// Catch-all for unknown URLs. It sits under /_public so the layout's
// beforeLoad sends gated visitors to /coming-soon first, and the 404 renders
// inside the layout with the Navbar and footer.
export const Route = createFileRoute("/_public/$")({
	beforeLoad: () => {
		throw notFound();
	},
});
