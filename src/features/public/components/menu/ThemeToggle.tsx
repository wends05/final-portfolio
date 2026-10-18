import { useEffect, useRef } from "react";
import { useStore } from "zustand";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchMotion } from "#/integrations/animations/motion";
import { type ThemeChoice, themeStore } from "#/lib/theme";
import { cn } from "#/lib/utils";

const LABELS: Record<ThemeChoice, string> = {
	auto: "Auto",
	light: "Light",
	dark: "Dark",
};

interface ThemeToggleProps {
	className?: string;
}

/**
 * Text that cycles the theme (auto → light → dark) on click. The old label
 * rolls up out of its mask while the new one rises in from below.
 */
export default function ThemeToggle({ className }: ThemeToggleProps) {
	const choice = useStore(themeStore, (s) => s.choice);
	const cycle = useStore(themeStore, (s) => s.cycle);
	const maskRef = useRef<HTMLSpanElement>(null);
	const labelRef = useRef<HTMLSpanElement>(null);
	// A copy of the old label, made on click. Only a click leaves one, so the
	// first render and hydrate() change the label without animating.
	const leavingRef = useRef<HTMLElement | null>(null);

	// Server and first render say "auto"; read the real choice after hydration.
	useEffect(() => {
		themeStore.getState().hydrate();
	}, []);

	useAppGSAP(
		() => {
			const leaving = leavingRef.current;
			const label = labelRef.current;
			leavingRef.current = null;
			if (!leaving || !label) return;

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
					.fromTo(label, { yPercent: 100 }, { yPercent: 0 }, 0);
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
		const label = labelRef.current;
		if (mask && label) {
			// The copy keeps the old text while React writes the new one.
			const copy = label.cloneNode(true) as HTMLElement;
			Object.assign(copy.style, { position: "absolute", top: "0", left: "0" });
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
			className={cn(
				"type-label focus-ring inline-flex min-h-11 items-center focus-visible:outline-focus-inverse",
				className,
			)}
		>
			{/* Clips only vertically, so the rolling labels keep their sides. */}
			<span ref={maskRef} className="relative inline-block overflow-y-clip">
				<span ref={labelRef} className="inline-block">
					{LABELS[choice]}
				</span>
			</span>
		</button>
	);
}
