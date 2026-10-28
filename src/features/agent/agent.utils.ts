import {
	absoluteUrl,
	buildSeo,
	markdownAlternate,
	truncateDescription,
} from "#/features/seo/seo.utils";
import type { AgentCopy } from "./agent.types";

/**
 * An agent view's head: kept out of search (`noindex`), with a canonical link
 * to the human page and an alternate link to the `.md` file.
 */
export function agentViewHead(copy: AgentCopy) {
	const seo = buildSeo({
		title: `${copy.title} (agent view)`,
		description: truncateDescription(copy.description),
		noindex: true,
	});
	return {
		...seo,
		links: [
			{ rel: "canonical", href: absoluteUrl(copy.path) },
			markdownAlternate(copy.path),
		],
	};
}
