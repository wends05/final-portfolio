import { INTRO_HERO_DELAY } from "./intro";

// Seconds and pixels, for GSAP. The page entrance from WD-51: every page's
// title rises out of its mask first, then the rest fades up, one after another.
export const ENTRANCE_TIMING = {
	/** The title's lines rising out of their masks. */
	titleRise: 0.72,
	/** Between one title line and the next, for titles that wrap. */
	titleLineStagger: 0.08,
	/** When the rest starts, counted from the title's start. */
	restAt: 0.56,
	/** Each item fading up. */
	item: 0.4,
	/** Between one item and the next. */
	itemStagger: 0.06,
	/** Items after this many start together, so long lists don't drag on. */
	itemStaggerCap: 10,
	/** How far each item rises, in px. */
	rise: 16,
	/** Reduced motion: everything fades in together instead. */
	reducedFade: 0.4,
};

/**
 * How long the entrance waits: through the intro curtain on a tab's first
 * load, otherwise not at all.
 */
export function getEntranceDelay(introPlaying: boolean): number {
	return introPlaying ? INTRO_HERO_DELAY : 0;
}

/** When item `index` starts, after the first item. Capped, see `itemStaggerCap`. */
export function getEntranceItemOffset(index: number): number {
	return (
		Math.min(index, ENTRANCE_TIMING.itemStaggerCap) *
		ENTRANCE_TIMING.itemStagger
	);
}
