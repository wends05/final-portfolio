import { SplitText } from "gsap/SplitText";
import type { RefObject } from "react";
import {
	ENTRANCE_TIMING,
	getEntranceDelay,
	getEntranceItemOffset,
} from "#/features/public/utils/entrance";
import { introPlaying } from "#/features/public/utils/intro";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchMotion } from "#/integrations/animations/motion";

/**
 * The page entrance (WD-51): the `[data-entrance-title]` element's lines rise
 * out of their masks, then every `[data-entrance]` element in `scope` fades up
 * in document order. Both start hidden (entrance.css) until this runs.
 *
 * Pass `key` when the page can change without remounting (one route, a new
 * slug), so the entrance plays again for the new content.
 */
export function usePageEntrance(
	scope: RefObject<HTMLElement | null>,
	key?: string,
) {
	useAppGSAP(
		() => {
			const el = scope.current;
			if (!el) return;
			const title = el.querySelector<HTMLElement>("[data-entrance-title]");
			const items = Array.from(
				el.querySelectorAll<HTMLElement>("[data-entrance]"),
			);
			const all = title ? [title, ...items] : items;
			// Cancel the CSS fail-safe that would show them after 10 seconds.
			for (const node of all) node.style.animation = "none";

			matchMotion(({ reduce }) => {
				const tl = appGSAP.timeline({
					delay: getEntranceDelay(introPlaying()),
				});

				if (reduce) {
					tl.fromTo(
						all,
						{ autoAlpha: 0 },
						{
							autoAlpha: 1,
							duration: ENTRANCE_TIMING.reducedFade,
							ease: "none",
						},
					);
					return;
				}

				if (title) {
					// Lines, not words, so a wrapped title rises line by line. The
					// masks get padding (cancelled by margin) so descenders aren't
					// clipped, and the split is undone once the lines are up so the
					// title rewraps freely on resize.
					const split = SplitText.create(title, {
						type: "lines",
						mask: "lines",
					});
					appGSAP.set(split.masks, {
						paddingBlock: "0.15em",
						marginBlock: "-0.15em",
					});
					appGSAP.set(title, { autoAlpha: 1 });
					tl.from(
						split.lines,
						{
							yPercent: 110,
							duration: ENTRANCE_TIMING.titleRise,
							ease: "swiss",
							stagger: ENTRANCE_TIMING.titleLineStagger,
						},
						0,
					).call(() => split.revert(), [], ENTRANCE_TIMING.titleRise + 0.4);
				}

				if (items.length) {
					tl.fromTo(
						items,
						{ autoAlpha: 0, y: ENTRANCE_TIMING.rise },
						{
							autoAlpha: 1,
							y: 0,
							duration: ENTRANCE_TIMING.item,
							ease: "swiss",
							stagger: (index) => getEntranceItemOffset(index),
						},
						title ? ENTRANCE_TIMING.restAt : 0,
					);
				}
			});
		},
		{ scope, dependencies: [key], revertOnUpdate: true },
	);
}
