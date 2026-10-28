import { useLenis } from "lenis/react";
import type { RefObject } from "react";
import { followNavigation, PICK_TIMING } from "#/features/public/utils/pick";
import { transitionStore } from "#/features/public/utils/transition/transition-store";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchMotion } from "#/integrations/animations/motion";

type Query = (selector: string) => HTMLElement[];
type Timeline = ReturnType<typeof appGSAP.timeline>;

export interface PickTargets {
	/** Fades out with the rest of the stage. */
	others: HTMLElement[];
	/** The ink wash inside the picked title, revealed left to right. */
	wash: Element;
	/** The picked title, faded last. */
	title: HTMLElement;
	/** Borders of the picked row, faded to transparent with the rest. */
	borders?: HTMLElement[];
}

interface UsePickTransitionOptions {
	scope: RefObject<HTMLElement | null>;
	/** Slug being picked, or null. Setting it starts the transition. */
	picking: string | null;
	/** The elements to animate for `slug`, or null to navigate straight away. */
	getTargets: (slug: string, q: Query) => PickTargets | null;
	/** Navigates to the picked page. The timeline waits for it. */
	navigate: (slug: string) => Promise<unknown>;
	/** Called when the navigation fails, after the list is put back; clear `picking` here. */
	onCancel?: () => void;
}

/**
 * List pick (a landing skill row, a project's "Read more"): the rest fades, an
 * ink wash sweeps across the picked title, the title fades, then the router
 * navigates. Lenis stops for the pick, so scrolling can't change what is on
 * stage, and starts again once the route resolves. The section transition
 * sees the pick as its source and plays only the page entrance. If the
 * navigation fails, the timeline reverts so the list shows again, and
 * `onCancel` runs.
 */
export function usePickTransition({
	scope,
	picking,
	getTargets,
	navigate,
	onCancel,
}: UsePickTransitionOptions) {
	const lenis = useLenis();

	useAppGSAP(
		() => {
			if (!picking) return;
			const el = scope.current;
			if (!el) return;
			const slug = picking;

			lenis?.stop();
			const q = appGSAP.utils.selector(el) as Query;
			const targets = getTargets(slug, q);

			const go = (tl: Timeline | null) => {
				tl?.pause();
				// The pick already showed the destination's name, so the section
				// transition skips its title card and plays only the entrance.
				transitionStore.getState().setSource("pick");
				void followNavigation(() => navigate(slug), {
					onArrive: () => {
						lenis?.start();
						tl?.resume();
					},
					onFail: () => {
						transitionStore.getState().setSource(null);
						lenis?.start();
						tl?.revert();
						onCancel?.();
					},
				});
			};

			if (!targets) {
				go(null);
				return;
			}

			const { others, wash, title, borders = [] } = targets;

			matchMotion(({ reduce }) => {
				const tl = appGSAP.timeline();

				// The card's own CSS transitions would lag every GSAP frame.
				tl.set([...others, title], { transition: "none" });

				if (reduce) {
					tl.to([...others, title], {
						opacity: 0,
						duration: PICK_TIMING.reducedFade,
						ease: "none",
					}).call(go, [tl], ">");
					return;
				}

				tl.to(others, {
					opacity: 0,
					duration: PICK_TIMING.fadeOthers,
					ease: "none",
				});
				if (borders.length) {
					tl.to(
						borders,
						{ borderColor: "transparent", duration: PICK_TIMING.fadeOthers },
						"<",
					);
				}
				tl.to(
					wash,
					{
						clipPath: "inset(0% 0% 0% 0%)",
						duration: PICK_TIMING.wash,
						ease: "swiss",
					},
					">",
				)
					.to(
						title,
						{ opacity: 0, duration: PICK_TIMING.titleOut, ease: "none" },
						">",
					)
					.call(go, [tl], ">");
			});
		},
		{ scope, dependencies: [picking] },
	);
}
