// Scroll distances of the pinned text sections (description, end), in svh, not
// seconds. GSAP timeline units equal them: scrub maps the timeline's whole
// duration onto the pinned scroll, so one unit of duration is 1svh of scroll.
export const PINNED_TEXT_SCROLL = {
	// The text fades in while the end of the previous section scrolls out.
	fadeIn: 25,
	// Every word inks, in reading order.
	fill: 100,
	// The next section rises over the pinned text. That takes one viewport of
	// scroll, so this must equal the stage height.
	cover: 100,
	// Height of the gradient above the covering section's top edge. It reaches
	// the text this much before the solid edge does.
	edge: 30,
	// Extra scroll with the finished text fully visible, before the gradient
	// enters the screen.
	hold: 35,
	// Share of the fill each word takes to ink; the rest is the stagger.
	inkShare: 0.2,
};

type PinnedTextScroll = typeof PINNED_TEXT_SCROLL;

// Height of the sticky stage (`h-svh`).
const STAGE = 100;

/**
 * Scroll between the end of the fill and the end of the timeline: the hold,
 * the gradient's lead, then the next section covering the stage.
 */
export function pinnedTextPad(scroll: PinnedTextScroll = PINNED_TEXT_SCROLL) {
	return scroll.hold + scroll.edge + scroll.cover;
}

/**
 * Height of the section in svh: the scroll the stage stays pinned for, plus
 * the stage itself. ScrollTrigger runs "top top" to "bottom bottom", so the
 * pinned scroll is exactly the runway minus the stage.
 */
export function pinnedTextRunway(
	scroll: PinnedTextScroll = PINNED_TEXT_SCROLL,
) {
	return scroll.fadeIn + scroll.fill + pinnedTextPad(scroll) + STAGE;
}
