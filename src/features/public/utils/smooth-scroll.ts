import type Lenis from "lenis";
import type { LenisOptions } from "lenis";

/**
 * Lenis setup for the public pages. GSAP's ticker drives it, so it runs no
 * loop of its own. Touch keeps native scrolling and momentum, reduced motion
 * turns smoothing off and makes jumps instant, and same-page `#hash` links
 * glide (offset by `scroll-padding-top` on `html`).
 */
export const LENIS_OPTIONS = {
	autoRaf: false,
	respectReducedMotion: true,
	smoothWheel: true,
	syncTouch: false,
	anchors: true,
	lerp: 0.2,
} as const satisfies LenisOptions;

/**
 * Drops any glide still running, so the router's scroll reset or restore
 * wins. Without it a navigation mid-glide lets Lenis ease the new page back
 * toward the old target. `stop` and `start` both reset the glide to the
 * current scroll; an immediate `scrollTo` would also swallow the next native
 * scroll event, which can be the router's. A stopped Lenis has nothing to
 * settle and stays stopped.
 */
export function settleLenis(
	lenis: Pick<Lenis, "isStopped" | "stop" | "start">,
) {
	if (lenis.isStopped) return;
	lenis.stop();
	lenis.start();
}

interface LocationLike {
	pathname: string;
	searchStr: string;
}

/**
 * Whether a navigation only moves to a `#hash` on the same page. The router
 * reports anchor clicks as navigations too; settling then would cancel the
 * anchor glide Lenis just started.
 */
export function isInPageJump({
	fromLocation,
	toLocation,
}: {
	fromLocation?: LocationLike;
	toLocation: LocationLike;
}) {
	return (
		fromLocation !== undefined &&
		fromLocation.pathname === toLocation.pathname &&
		fromLocation.searchStr === toLocation.searchStr
	);
}
