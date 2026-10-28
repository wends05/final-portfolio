/** Which version of a page is showing: the human page or its agent view. */
export type SiteView = "human" | "machine";

/** A page and its twin: the human page and the agent view of the same page. */
export interface ViewTwins {
	view: SiteView;
	human: string;
	machine: string;
}

/** Agent views live under this prefix: `/projects` ↔ `/ai/projects`. */
export const AGENT_VIEW_PREFIX = "/ai";

function trimTrailingSlash(path: string) {
	return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

/**
 * The page paths that have twins: the home page, the two lists, and one
 * project or skill (slugs are kebab-case, so `/projects/foo.md` is a file,
 * not a page). Anything else (the coming-soon page, deeper paths) has none.
 */
function isTwinnedPage(path: string) {
	return /^\/((projects|skills)(\/[a-z0-9-]+)?)?$/.test(path);
}

/**
 * The human page and agent view for a pathname, and which one it is. Null
 * for a path that is neither, so the toggle hides there.
 */
export function getViewTwins(pathname: string): ViewTwins | null {
	const path = trimTrailingSlash(pathname);
	if (path === AGENT_VIEW_PREFIX || path.startsWith(`${AGENT_VIEW_PREFIX}/`)) {
		const human = path.slice(AGENT_VIEW_PREFIX.length) || "/";
		return isTwinnedPage(human)
			? { view: "machine", human, machine: path }
			: null;
	}
	if (!isTwinnedPage(path)) return null;
	return { view: "human", human: path, machine: agentViewPath(path) };
}

/** The agent view of a human page: `/` → `/ai`, `/projects/x` → `/ai/projects/x`. */
export function agentViewPath(humanPath: string) {
	const path = trimTrailingSlash(humanPath);
	return path === "/" ? AGENT_VIEW_PREFIX : `${AGENT_VIEW_PREFIX}${path}`;
}

/** The agent copy of a human page: `/` → `/index.md`, `/projects/x` → `/projects/x.md`. */
export function agentCopyPath(humanPath: string) {
	const path = trimTrailingSlash(humanPath);
	return path === "/" ? "/index.md" : `${path}.md`;
}

/**
 * Where a link in an agent copy goes inside the agent view: a link to one of
 * the site's human pages becomes that page's agent view, so a reader stays in
 * the machine view. Anything else (agent files, the CV, other sites) is null
 * and keeps its own URL.
 */
export function agentViewLink(href: string, origin: string): string | null {
	const base = origin.replace(/\/+$/, "");
	let path: string;
	if (href === base || href.startsWith(`${base}/`)) {
		path = href.slice(base.length) || "/";
	} else if (href.startsWith("/") && !href.startsWith("//")) {
		path = href;
	} else {
		return null;
	}
	const twins = getViewTwins(path);
	return twins?.view === "human" ? twins.machine : null;
}
