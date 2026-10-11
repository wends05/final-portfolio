// Seconds, for GSAP. A list pick (a landing skill row, a project's "Read
// more"): the rest fades, an ink wash sweeps across the picked title, the
// title fades, then the router navigates.
export const PICK_TIMING = {
	fadeOthers: 0.4,
	wash: 0.4,
	titleOut: 0.3,
	// Reduced motion: everything fades together instead.
	reducedFade: 0.2,
};

type ClickLike = Pick<
	React.MouseEvent,
	"button" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey"
>;

/**
 * True for a plain left click: the one click a pick animation takes over.
 * Any modifier (new tab, new window, download) or another mouse button is
 * left to the browser, so the link keeps working as a link.
 */
export const isPlainClick = (event: ClickLike) =>
	event.button === 0 &&
	!event.metaKey &&
	!event.ctrlKey &&
	!event.shiftKey &&
	!event.altKey;
