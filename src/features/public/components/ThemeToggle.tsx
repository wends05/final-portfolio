import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchMotion } from "#/integrations/animations/motion";
import { type ThemeChoice, themeStore } from "#/lib/theme";
import { cn } from "#/lib/utils";

const CHOICES: ThemeChoice[] = ["auto", "light", "dark"];

const LABELS: Record<ThemeChoice, string> = {
	auto: "Auto",
	light: "Light",
	dark: "Dark",
};

interface ThemeToggleProps {
	/**
	 * Unique per toggle on the page. The theme crossfade captures the toggle
	 * apart from the page and shows only its live label, so the old frame's
	 * label never fades over the roll (src/styles/theme-toggle.css).
	 */
	transitionName: "theme-toggle-nav" | "theme-toggle-menu";
	/** Extra classes, e.g. visibility or the focus ring colour for its ground. */
	className?: string;
}

/**
 * Text that cycles the theme (auto → light → dark) on click. It renders every
 * label and CSS shows the one matching data-theme-choice on <html>
 * (src/styles/theme-toggle.css), so the label is right from the first paint.
 * On click the old label rolls up out of its mask while the new one rises in.
 */
export default function ThemeToggle({
	transitionName,
	className,
}: ThemeToggleProps) {
	const choice = useStore(themeStore, (s) => s.choice);
	const cycle = useStore(themeStore, (s) => s.cycle);
	const maskRef = useRef<HTMLSpanElement>(null);
	// A copy of the old label, made on click. Only a click leaves one, so the
	// first render and hydrate() change the store without animating.
	const leavingRef = useRef<HTMLElement | null>(null);

	// The store starts on "auto"; read the real choice after hydration.
	useEffect(() => {
		themeStore.getState().hydrate();
	}, []);

	useAppGSAP(
		() => {
			const leaving = leavingRef.current;
			const incoming = maskRef.current?.querySelector<HTMLElement>(
				`[data-theme-label="${choice}"]`,
			);
			leavingRef.current = null;
			if (!leaving || !incoming) return;

			matchMotion(({ reduce }) => {
				if (reduce) {
					leaving.remove();
					return undefined;
				}

				appGSAP
					.timeline({
						defaults: { duration: 0.45, ease: "swiss", overwrite: true },
						onComplete: () => leaving.remove(),
					})
					.fromTo(leaving, { yPercent: 0 }, { yPercent: -100 }, 0)
					.fromTo(incoming, { yPercent: 100 }, { yPercent: 0 }, 0);
				// A click before this roll ends reverts it; drop its copy too.
				return () => leaving.remove();
			});
		},
		// Each click's roll is one-off: revert the last one (and its
		// matchMedia context) before the next runs, so contexts don't pile up.
		{ dependencies: [choice], revertOnUpdate: true },
	);

	const onClick = () => {
		const mask = maskRef.current;
		const shown = mask?.querySelector<HTMLElement>(
			`[data-theme-label="${themeStore.getState().choice}"]`,
		);
		if (mask && shown) {
			// The copy keeps the old text after the labels swap. It loses
			// data-theme-label so the CSS that hides other labels leaves it alone.
			const copy = shown.cloneNode(true) as HTMLElement;
			copy.removeAttribute("data-theme-label");
			Object.assign(copy.style, {
				position: "absolute",
				top: "0",
				left: "0",
				display: "inline-block",
			});
			copy.setAttribute("aria-hidden", "true");
			mask.appendChild(copy);
			leavingRef.current = copy;
		}
		cycle();
	};

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={`Theme: ${LABELS[choice]}. Change theme`}
			style={{ viewTransitionName: transitionName }}
			className={cn(
				"type-label focus-ring inline-flex min-h-11 items-center",
				className,
			)}
		>
			{/* Clips only vertically, so the rolling labels keep their sides. */}
			<span ref={maskRef} className="relative inline-block overflow-y-clip">
				{CHOICES.map((c) => (
					<span key={c} data-theme-label={c}>
						{LABELS[c]}
					</span>
				))}
			</span>
		</button>
	);
}
