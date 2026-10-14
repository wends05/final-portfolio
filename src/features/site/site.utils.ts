/** True when public pages should redirect to /coming-soon. */
export function isSiteGated(comingSoon: string | undefined) {
	return comingSoon === "true";
}

export type ErrorPageKind = "404" | "500" | "error";

/** A link to another page, or a button that re-runs the failed page. */
export type ErrorPageAction =
	| { type: "link"; label: string; to: string }
	| { type: "retry"; label: string };

export interface ErrorPageCopy {
	/** Shown in the meta row before the path: "404 · /projects/old". */
	code: string;
	/** Eyebrow above the title. */
	label: string;
	message: string;
	details: string;
	primary: ErrorPageAction;
	secondary: ErrorPageAction;
}

const backHome: ErrorPageAction = { type: "link", label: "Back home", to: "/" };
const tryAgain: ErrorPageAction = { type: "retry", label: "Try again" };

const errorPageCopy: Record<ErrorPageKind, ErrorPageCopy> = {
	"404": {
		code: "404",
		label: "404 · Not found",
		message: "this page does not exist",
		details: "The page may be old, or a typo exists.",
		primary: backHome,
		secondary: { type: "link", label: "See projects", to: "/projects" },
	},
	"500": {
		code: "500",
		label: "500 · Server error",
		message: "something broke",
		details: "The server cannot build the page.",
		primary: tryAgain,
		secondary: backHome,
	},
	error: {
		code: "Error",
		label: "Error",
		message: "this page didn't load",
		details:
			"Something went wrong while trying to load this page. Try to refresh.",
		primary: tryAgain,
		secondary: backHome,
	},
};

export function getErrorPageCopy(kind: ErrorPageKind): ErrorPageCopy {
	return errorPageCopy[kind];
}

/**
 * The error text to show on the page: only in development, so production
 * never leaks messages, stack traces or query details. Returns null when
 * there is nothing readable to show.
 */
export function getSafeErrorDetail(
	error: unknown,
	isDev: boolean = import.meta.env.DEV,
): string | null {
	if (!isDev) return null;

	let message: unknown = error;
	if (error instanceof Error) message = error.message;
	// Errors from server functions can arrive as plain objects.
	else if (typeof error === "object" && error !== null && "message" in error)
		message = error.message;

	if (typeof message !== "string") return null;
	return message.trim() || null;
}

/** What the browser receives in place of a server error in production. */
export const PUBLIC_ERROR_MESSAGE = "Something went wrong.";

/**
 * Errors are serialized into the page for hydration and into server function
 * responses. In production, every Error is sent as PUBLIC_ERROR_MESSAGE.
 */
export function shouldHideError(
	value: unknown,
	isDev: boolean = import.meta.env.DEV,
): value is Error {
	return !isDev && value instanceof Error;
}
