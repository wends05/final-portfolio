import { isSiteGated } from "#/features/site/site.utils";
import { getAgentFile } from "./agent.content";

const CONTENT_TYPES = {
	md: "text/markdown; charset=utf-8",
	txt: "text/plain; charset=utf-8",
} as const;

/**
 * The response for an agent file (ADR 0021): the copy, `llms.txt` or
 * `sitemap.md` as text, or 404 when there is none (an unknown or draft
 * slug) or the site is gated. Served by server routes, not static files, so
 * no file in `public/` can stand in for a page.
 */
export function agentFileResponse(
	file: string,
	comingSoon: string | undefined = process.env.COMING_SOON,
): Response {
	const found = isSiteGated(comingSoon) ? undefined : getAgentFile(file);
	if (!found) {
		return new Response("Not found\n", {
			status: 404,
			headers: { "Content-Type": CONTENT_TYPES.txt },
		});
	}
	const type = file.endsWith(".txt") ? CONTENT_TYPES.txt : CONTENT_TYPES.md;
	return new Response(found.text, {
		headers: {
			"Content-Type": type,
			"Cache-Control": "public, max-age=0, s-maxage=3600",
		},
	});
}
