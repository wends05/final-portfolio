import { type BlockerFn, useRouter } from "@tanstack/react-router";
import { useLenis } from "lenis/react";
import { type RefObject, useEffect, useRef } from "react";
import { menuStore } from "#/features/public/utils/menu/menu-store";
import {
	chooseTransition,
	getEntranceStart,
	getSection,
	readVisited,
	rememberVisited,
	SECTION_TIMING,
	type TransitionKind,
} from "#/features/public/utils/transition/transition";
import { transitionStore } from "#/features/public/utils/transition/transition-store";
import { appGSAP } from "#/integrations/animations/gsap";
import { prefersReducedMotion } from "#/integrations/animations/motion";

type Timeline = ReturnType<typeof appGSAP.timeline>;
type HistoryAction = Parameters<BlockerFn>[0]["action"];
type PanelState = "hidden" | "moving" | "covered";

interface PendingCover {
	/** Lets the held navigation through (false) or drops it (true). */
	resolve: (blocked: boolean) => void;
	action: HistoryAction;
}

interface SectionTransitionProps {
	/** The page area: faded out and in around the route change. */
	page: RefObject<HTMLElement | null>;
}

/** Moves focus to the new page's h1, for screen readers and keyboard users. */
function focusHeading(page: HTMLElement | null) {
	const heading = page?.querySelector("h1");
	if (!heading) return;
	if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
	heading.focus({ preventScroll: true });
}

/**
 * Focuses the heading once nothing makes the page `inert`, which blocks focus:
 * after the menu has closed (its close hands focus to the Menu button first),
 * and a frame later, once React has re-rendered.
 */
function focusWhenFree(page: HTMLElement | null) {
	const focus = () => requestAnimationFrame(() => focusHeading(page));
	if (menuStore.getState().phase === "closed") return focus();
	const unsubscribe = menuStore.subscribe((state) => {
		if (state.phase !== "closed") return;
		unsubscribe();
		focus();
	});
}

/**
 * The section transition (WD-51). A history blocker holds each navigation
 * while the ink panel covers the screen (or the page fades out), then lets it
 * through; once the new route has rendered, the section name shows on the
 * panel, the panel lifts and the page's entrance is released. Which steps play
 * comes from `chooseTransition`. A navigation during a transition drops the
 * pending steps and runs toward the newest target.
 */
export default function SectionTransition({ page }: SectionTransitionProps) {
	const router = useRouter();
	const lenis = useLenis();
	const panelRef = useRef<HTMLDivElement>(null);
	const titleRef = useRef<HTMLParagraphElement>(null);
	const timeline = useRef<Timeline | null>(null);
	const pending = useRef<PendingCover | null>(null);
	const arriving = useRef<TransitionKind | null>(null);
	const panelState = useRef<PanelState>("hidden");

	// The first load counts as a visit to its section.
	useEffect(() => {
		rememberVisited(getSection(router.state.location.pathname));
	}, [router]);

	// Nothing is left running or held when the layout unmounts.
	useEffect(
		() => () => {
			timeline.current?.kill();
			pending.current?.resolve(false);
			pending.current = null;
			const store = transitionStore.getState();
			store.setCovering(false);
			store.releaseEntrance();
		},
		[],
	);

	useEffect(() => {
		const store = transitionStore.getState();

		const supersede = () => {
			timeline.current?.kill();
			timeline.current = null;
			const previous = pending.current;
			pending.current = null;
			if (!previous) return;
			// A newer click wins: drop the older push. A back or forward has
			// already moved the browser, and dropping it would move it again,
			// so let it through and run on toward the newest target.
			previous.resolve(
				previous.action === "PUSH" || previous.action === "REPLACE",
			);
		};

		const cover = (kind: "card" | "fade", action: HistoryAction) =>
			new Promise<boolean>((resolve) => {
				const panel = panelRef.current;
				const title = titleRef.current;
				const reduce = prefersReducedMotion();
				pending.current = { resolve, action };

				const tl = appGSAP.timeline({
					onComplete: () => {
						if (kind === "card") panelState.current = "covered";
						if (pending.current?.resolve === resolve) pending.current = null;
						resolve(false);
					},
				});
				timeline.current = tl;

				if (kind === "fade") {
					tl.to(page.current, {
						opacity: 0,
						duration: SECTION_TIMING.fadeOut,
						ease: "none",
					});
					return;
				}

				store.setCovering(true);
				tl.set(title, { autoAlpha: 0 }, 0);
				const duration =
					panelState.current === "covered"
						? 0
						: reduce
							? SECTION_TIMING.reducedPanel
							: SECTION_TIMING.cover;
				if (panelState.current === "hidden") {
					tl.set(panel, {
						autoAlpha: reduce ? 0 : 1,
						clipPath: reduce ? "inset(0% 0% 0% 0%)" : "inset(100% 0% 0% 0%)",
					});
				}
				panelState.current = "moving";
				tl.to(
					panel,
					reduce
						? { autoAlpha: 1, duration, ease: "none" }
						: { clipPath: "inset(0% 0% 0% 0%)", duration, ease: "curtain" },
				);
			});

		const reveal = (kind: TransitionKind, pathname: string) => {
			const panel = panelRef.current;
			const title = titleRef.current;
			const content = page.current;
			const reduce = prefersReducedMotion();
			const tl = appGSAP.timeline();
			timeline.current = tl;

			const framed = kind === "card" || kind === "menu";
			const liftAt =
				kind === "card" ? SECTION_TIMING.titleIn + SECTION_TIMING.hold : 0;

			if (kind === "card" && title) {
				lenis?.scrollTo(0, { immediate: true, force: true });
				if (!lenis) window.scrollTo(0, 0);
				title.textContent = getSection(pathname) ?? "";
				tl.fromTo(
					title,
					{ autoAlpha: 0 },
					{
						autoAlpha: 1,
						duration: SECTION_TIMING.titleIn,
						ease: "swiss",
					},
					0,
				).to(
					title,
					{ autoAlpha: 0, duration: SECTION_TIMING.titleOut, ease: "none" },
					liftAt,
				);
			}

			if (panelState.current !== "hidden") {
				tl.call(
					() => {
						panelState.current = "moving";
					},
					[],
					liftAt,
				)
					.to(
						panel,
						reduce
							? {
									autoAlpha: 0,
									duration: SECTION_TIMING.reducedPanel,
									ease: "none",
								}
							: {
									clipPath: "inset(0% 0% 100% 0%)",
									duration: SECTION_TIMING.lift,
									ease: "curtain",
								},
						liftAt,
					)
					.set(panel, { autoAlpha: 0 })
					.call(() => {
						panelState.current = "hidden";
					});
			}

			// The frame and rules fade in under the lifting panel, without type:
			// the entrance still holds every title and item hidden.
			if (framed) {
				tl.fromTo(
					content,
					{ opacity: 0 },
					{ opacity: 1, duration: SECTION_TIMING.frameIn, ease: "none" },
					liftAt,
				);
			} else {
				tl.set(content, { opacity: 1 }, 0);
			}

			tl.call(
				() => {
					store.setCovering(false);
					store.releaseEntrance();
					focusWhenFree(content);
				},
				[],
				getEntranceStart(kind),
			);
		};

		const unblock = router.history.block({
			enableBeforeUnload: false,
			blockerFn: ({ currentLocation, nextLocation, action }) => {
				const source =
					menuStore.getState().phase === "leaving"
						? "menu"
						: (transitionStore.getState().source ?? "link");
				store.setSource(null);
				const kind = chooseTransition({
					from: currentLocation.pathname,
					to: nextLocation.pathname,
					source,
					visited: readVisited(),
				});
				if (kind === "none") return false;

				supersede();
				store.holdEntrance();
				arriving.current = kind;
				if (kind === "card" || kind === "fade") return cover(kind, action);
				return false;
			},
		});

		const unsubscribe = router.subscribe("onRendered", (event) => {
			const kind = arriving.current;
			if (!kind) return;
			arriving.current = null;
			rememberVisited(getSection(event.toLocation.pathname));
			reveal(kind, event.toLocation.pathname);
		});

		return () => {
			unblock();
			unsubscribe();
		};
	}, [router, lenis, page]);

	return (
		<div
			ref={panelRef}
			aria-hidden="true"
			className="invisible fixed inset-0 z-55 flex items-center justify-center bg-inverse px-4 text-inverse-foreground"
		>
			{/* The one centred text on the site: the section name on the panel. */}
			<p ref={titleRef} className="invisible text-center text-display-xl" />
		</div>
	);
}
