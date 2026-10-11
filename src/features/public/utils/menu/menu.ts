export const MENU_PANEL_ID = "site-menu";
export const MENU_BUTTON_ID = "site-menu-button";

export const MENU_ITEMS = [
	{ to: "/", label: "home" },
	{ to: "/skills", label: "skills" },
	{ to: "/projects", label: "projects" },
] as const;

export type MenuPath = (typeof MENU_ITEMS)[number]["to"];

// Seconds, for GSAP.
export const MENU_TIMING = {
	reducedFade: 0.2,
	curtainIn: 0.6,
	curtainOut: 0.64,
	wordsAt: 0.22,
	wordsStagger: 0.07,
	words: 0.72,
	labelsAt: 0.48,
	labels: 0.4,
	navigateAt: 0.38,
	fadeOut: 0.4,
	wash: 0.4,
};

function trimTrailingSlash(path: string) {
	return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

function firstSegment(path: string) {
	return trimTrailingSlash(path).split("/")[1] ?? "";
}

/** The menu item is the exact page being shown: `/projects` on `/projects`, not on `/projects/<slug>`. */
export function isCurrentPage(itemPath: string, pathname: string) {
	return trimTrailingSlash(itemPath) === trimTrailingSlash(pathname);
}

/** The menu item's section contains the page: `/projects` on `/projects` and `/projects/<slug>`. */
export function isCurrentSection(itemPath: string, pathname: string) {
	return firstSegment(itemPath) === firstSegment(pathname);
}
