import { createFileRoute, notFound } from "@tanstack/react-router";

// Unknown paths under /ai show the 404 page, like the public catch-all.
export const Route = createFileRoute("/ai/$")({
	beforeLoad: () => {
		throw notFound();
	},
});
