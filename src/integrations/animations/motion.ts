import { appGSAP } from "#/integrations/animations/gsap";

// gsap.matchMedia() only runs a callback when one of its conditions matches,
// so pass both: { motion: FULL_MOTION, reduce: REDUCED_MOTION }.
export const FULL_MOTION = "(prefers-reduced-motion: no-preference)";
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type Cleanup = () => void;

/**
 * Runs `setup` with full motion, or with reduced motion when `reduce` is true.
 * Return a cleanup to undo the setup when the preference changes or the scope
 * reverts.
 */
export function matchMotion(
	setup: (conditions: { reduce: boolean }) => undefined | Cleanup,
) {
	return appGSAP
		.matchMedia()
		.add({ motion: FULL_MOTION, reduce: REDUCED_MOTION }, ({ conditions }) =>
			setup({ reduce: !!conditions?.reduce }),
		);
}

/**
 * Runs `setup` with full motion only. With reduced motion nothing runs, and the
 * element stays as rendered.
 */
export function matchFullMotion(setup: () => undefined | Cleanup) {
	return appGSAP.matchMedia().add(FULL_MOTION, setup);
}

/**
 * Whether reduced motion is on right now. For one-off timelines started by an
 * event, such as a navigation, which end before the preference could change;
 * use `matchMotion` for anything that stays on the page.
 */
export function prefersReducedMotion() {
	return (
		typeof window !== "undefined" && window.matchMedia(REDUCED_MOTION).matches
	);
}
