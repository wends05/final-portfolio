import { isCurrentSection, MENU_ITEMS } from "../menu/menu";

// Seconds, for GSAP. The section transition from WD-51: an ink panel covers
// the screen, the router navigates, the section name fades in at the centre,
// then the panel lifts and the page plays its entrance.
export const SECTION_TIMING = {
	/** The panel wiping up from the bottom edge until it covers the screen. */
	cover: 0.46,
	/** The section name fading in, once the route has loaded. */
	titleIn: 0.4,
	/** The name resting on the panel. */
	hold: 0.6,
	/** The name fading out as the panel starts to lift. */
	titleOut: 0.24,
	/** The panel lifting off the top edge. */
	lift: 0.6,
	/** The new page's frame and rules fading in, before its entrance. */
	frameIn: 0.32,
	/** A move within a section, or to one already visited: the page fades out. */
	fadeOut: 0.15,
	/** Reduced motion: the panel fades in and out instead of wiping. */
	reducedPanel: 0.2,
};

/** A section of the site: the first path segment, named as in the menu. */
export type Section = (typeof MENU_ITEMS)[number]["label"];

/**
 * Where the navigation started:
 * - `menu`: a menu pick; its panel already covers the screen.
 * - `pick`: a list pick; its wash already showed the destination's name.
 * - `link`: anything else, back and forward included.
 */
export type TransitionSource = "link" | "menu" | "pick";

/**
 * What plays:
 * - `none`: nothing, the page stays (same path, such as a filter or a `#hash`).
 * - `card`: the full sequence, with the section name on the ink panel.
 * - `fade`: the page fades out, then the entrance.
 * - `menu`: the frame fades in under the lifting menu, then the entrance.
 * - `pick`: the entrance only.
 */
export type TransitionKind = "none" | "card" | "fade" | "menu" | "pick";

/** The section `pathname` is in, or null for a path outside the sections. */
export function getSection(pathname: string): Section | null {
	return (
		MENU_ITEMS.find((item) => isCurrentSection(item.to, pathname))?.label ??
		null
	);
}

interface TransitionChoice {
	from: string;
	to: string;
	source: TransitionSource;
	/** Sections already visited in this tab. */
	visited: ReadonlySet<Section>;
}

/**
 * Picks the transition for a navigation from `from` to `to` (pathnames). The
 * title card plays only when the first path segment changes to a section not
 * yet visited in this tab, and only for a navigation the menu or a list pick
 * didn't start.
 */
export function chooseTransition({
	from,
	to,
	source,
	visited,
}: TransitionChoice): TransitionKind {
	if (trimTrailingSlash(from) === trimTrailingSlash(to)) return "none";
	if (source !== "link") return source;
	const section = getSection(to);
	if (!section || section === getSection(from) || visited.has(section)) {
		return "fade";
	}
	return "card";
}

/**
 * When the page entrance starts, counted from the moment the new route has
 * rendered: after the title card's name and the frame's fade, after the
 * frame's fade under the menu, or at once.
 */
export function getEntranceStart(kind: TransitionKind): number {
	if (kind === "card") {
		return (
			SECTION_TIMING.titleIn + SECTION_TIMING.hold + SECTION_TIMING.frameIn
		);
	}
	if (kind === "menu") return SECTION_TIMING.frameIn;
	return 0;
}

function trimTrailingSlash(path: string) {
	return path.length > 1 ? path.replace(/\/+$/, "") : path;
}

export const VISITED_KEY = "visited-sections";

type ReadStorage = Pick<Storage, "getItem">;
type WriteStorage = Pick<Storage, "getItem" | "setItem">;

function sessionStore(): Storage | null {
	try {
		return typeof sessionStorage === "undefined" ? null : sessionStorage;
	} catch {
		return null;
	}
}

/**
 * The sections visited in this tab, from `sessionStorage`. Empty when storage
 * is blocked or holds something unexpected.
 */
export function readVisited(
	storage: ReadStorage | null = sessionStore(),
): Set<Section> {
	const known = new Set<string>(MENU_ITEMS.map((item) => item.label));
	try {
		const stored: unknown = JSON.parse(storage?.getItem(VISITED_KEY) ?? "[]");
		if (!Array.isArray(stored)) return new Set();
		return new Set(
			stored.filter((value): value is Section => known.has(value)),
		);
	} catch {
		return new Set();
	}
}

/** Remembers `section` as visited in this tab. Does nothing for null. */
export function rememberVisited(
	section: Section | null,
	storage: WriteStorage | null = sessionStore(),
) {
	if (!section || !storage) return;
	const visited = readVisited(storage);
	if (visited.has(section)) return;
	visited.add(section);
	try {
		storage.setItem(VISITED_KEY, JSON.stringify([...visited]));
	} catch {}
}
