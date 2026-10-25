import { createFileRoute } from "@tanstack/react-router";
import { buildRobotsTxt } from "#/features/seo/seo.utils";
import { isSiteGated } from "#/features/site/site.utils";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () =>
				new Response(buildRobotsTxt(isSiteGated(process.env.COMING_SOON)), {
					headers: {
						"Content-Type": "text/plain; charset=utf-8",
						"Cache-Control": "public, max-age=0, s-maxage=3600",
					},
				}),
		},
	},
});
