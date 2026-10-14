import { useRouter, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import MenuItem from "#/features/public/components/menu/MenuItem";
import {
	MENU_BUTTON_ID,
	MENU_ITEMS,
	MENU_PANEL_ID,
	MENU_TIMING,
} from "#/features/public/utils/menu/menu";
import { menuStore } from "#/features/public/utils/menu/menu-store";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchMotion } from "#/integrations/animations/motion";
import { cn } from "#/lib/utils";

// Full-screen site menu (WD-53). The top bar sits above it, so its Close
// button stays reachable; the page behind is made inert by RootLayout.
export default function SiteMenu() {
	const router = useRouter();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const phase = useStore(menuStore, (s) => s.phase);
	const close = useStore(menuStore, (s) => s.close);
	const finish = useStore(menuStore, (s) => s.finish);
	const isShown = phase !== "closed";
	const panelRef = useRef<HTMLElement>(null);
	const firstLinkRef = useRef<HTMLAnchorElement>(null);

	// Any navigation (a pick, back, forward) closes the menu.
	useEffect(
		() =>
			router.subscribe("onBeforeNavigate", () => menuStore.getState().close()),
		[router],
	);

	// Focus the first link when the menu opens.
	useEffect(() => {
		if (!isShown) return;
		const panel = panelRef.current;
		firstLinkRef.current?.focus();

		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") close();
		};
		document.addEventListener("keydown", onKeyDown);

		return () => {
			document.removeEventListener("keydown", onKeyDown);
			// The panel is hidden by now, so focus inside it has fallen to body.
			// The button is outside the panel, so it is looked up by id.
			const active = document.activeElement;
			if (active === document.body || panel?.contains(active)) {
				document.getElementById(MENU_BUTTON_ID)?.focus();
			}
		};
	}, [isShown, close]);

	// animations
	useAppGSAP(
		() => {
			if (phase === "closed") return;

			const panelElement = panelRef.current;
			if (!panelElement) return;

			// Navigates to the picked page while the panel still covers the
			// screen. The timeline waits here until the route has loaded.
			const navigateToTarget = (tl: ReturnType<typeof appGSAP.timeline>) => {
				const { target } = menuStore.getState();
				if (!target) return;
				tl.pause();
				router.navigate({ to: target }).finally(() => tl.resume());
			};

			matchMotion(({ reduce }) => {
				const tl = appGSAP.timeline();

				// Reduced motion: the panel only fades, nothing moves.
				if (reduce) {
					if (phase === "open") {
						tl.fromTo(
							panelElement,
							{ autoAlpha: 0 },
							{
								autoAlpha: 1,
								duration: MENU_TIMING.reducedFade,
								ease: "none",
							},
						);
						return;
					}
					if (phase === "leaving") tl.call(navigateToTarget, [tl]);
					tl.to(panelElement, {
						autoAlpha: 0,
						duration: MENU_TIMING.reducedFade,
						ease: "none",
						onComplete: finish,
					});
					return;
				}

				// Full motion. String targets are scoped to the panel (scope: panelRef).
				// Targets: panelElement (the ink panel), [data-menu-word] (each word
				// with its wash, inside its mask), [data-pick-wash] (the paper sweep),
				// [data-menu-label] (the escape hint).
				// .to/.fromTo take the start time on the timeline as their last
				// argument; the duration goes inside the vars object.
				const q = appGSAP.utils.selector(panelElement);

				if (phase === "open") {
					// panel opening
					tl.fromTo(
						panelElement,
						{ clipPath: "inset(0% 0% 100% 0%)" },
						{
							clipPath: "inset(0% 0% 0% 0%)",
							duration: MENU_TIMING.curtainIn,
							ease: "curtain",
						},
					)
						// stagger the animation from each word
						.fromTo(
							"[data-menu-word]",
							{ yPercent: 110 },
							{
								yPercent: 0,
								duration: MENU_TIMING.words,
								ease: "swiss",
								stagger: MENU_TIMING.wordsStagger,
							},
							MENU_TIMING.wordsAt,
						)
						// animate the labels in
						.fromTo(
							"[data-menu-label]",
							{ autoAlpha: 0 },
							{
								autoAlpha: 1,
								duration: MENU_TIMING.labels,
								ease: "swiss",
							},
							MENU_TIMING.labelsAt,
						);
				}

				if (phase === "closing") {
					tl.to("[data-menu-word]", {
						autoAlpha: 0,
						duration: MENU_TIMING.fadeOut,
					}).to(panelElement, {
						clipPath: "inset(0% 0% 100% 0%)",
						duration: MENU_TIMING.curtainOut,
						ease: "curtain",
						onComplete: finish,
					});
				}

				if (phase === "leaving") {
					const { target } = menuStore.getState();
					const picked = panelElement.querySelector(
						`a[href="${target}"] [data-menu-word]`,
					);

					const others = q<HTMLElement>("[data-menu-word]").filter(
						(word) => word !== picked,
					);
					const pickedWash = picked?.querySelector("[data-pick-wash]");

					if (!picked || !pickedWash) return;

					const currentDot = panelElement.querySelector(
						"[data-menu-dot][data-current]",
					);
					const targetDot = panelElement.querySelector(
						`a[href="${target}"] [data-menu-dot]`,
					);

					if (currentDot && targetDot) {
						const distance =
							targetDot.getBoundingClientRect().top -
							currentDot.getBoundingClientRect().top;
						if (distance !== 0) {
							tl.to(
								currentDot,
								{
									y: distance,
									duration: MENU_TIMING.fadeOut,
									ease: "swiss",
								},
								0,
							);
						}
					}

					tl.to(
						others,
						{
							opacity: 0,
							duration: MENU_TIMING.fadeOut,
						},
						0,
					)
						.to(
							pickedWash,
							{
								clipPath: "inset(0% 0% 0% 0%)",
								duration: MENU_TIMING.wash,
								ease: "swiss",
							},
							">",
						)
						.call(navigateToTarget, [tl], `>${MENU_TIMING.navigateAt}`)
						.to(
							panelElement,
							{
								clipPath: "inset(0% 0% 100% 0%)",
								duration: MENU_TIMING.curtainOut,
								ease: "curtain",
								onComplete: finish,
							},
							">",
						);
				}
			});
		},
		{
			scope: panelRef,
			dependencies: [phase],
			revertOnUpdate: true,
		},
	);

	return (
		<nav
			ref={panelRef}
			id={MENU_PANEL_ID}
			aria-label="Site"
			className={cn(
				"fixed inset-0 z-40 flex-col bg-inverse text-inverse-foreground",
				isShown ? "flex" : "hidden",
			)}
		>
			<div className="page-grid w-full flex-1 content-start pt-28 md:pt-36">
				<ul className="group/list col-span-full border-rule-inverse border-b md:col-span-7 md:col-start-3">
					{MENU_ITEMS.map((item, index) => (
						<MenuItem
							key={item.to}
							item={item}
							pathname={pathname}
							ref={index === 0 ? firstLinkRef : undefined}
						/>
					))}
				</ul>
			</div>
			<div className="page-grid hidden w-full pb-8 md:grid">
				<p
					data-menu-label
					className="type-label col-span-full border-rule-inverse border-t pt-5 text-right text-inverse-muted"
				>
					Esc to close
				</p>
			</div>
		</nav>
	);
}
