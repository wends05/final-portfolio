import { createFileRoute } from "@tanstack/react-router";
import { getSitemapPaths } from "#/features/seo/seo.content";
import { buildSitemapXml } from "#/features/seo/seo.utils";
import { isSiteGated } from "#/features/site/site.utils";

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: () =>
				new Response(
					// A gated site lists nothing: its pages redirect to /coming-soon.
					buildSitemapXml(
						isSiteGated(process.env.COMING_SOON) ? [] : getSitemapPaths(),
					),
					{
						headers: {
							"Content-Type": "application/xml; charset=utf-8",
							"Cache-Control": "public, max-age=0, s-maxage=3600",
						},
					},
				),
		},
	},
});
