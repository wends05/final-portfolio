import { SplitText } from "gsap/SplitText";
import { useRef } from "react";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchFullMotion } from "#/integrations/animations/motion";
import { cn } from "#/lib/utils";

interface RollingTextProps {
	text: string;
	className?: string;
}

/**
 * Text whose letters roll up on hover: each letter leaves through the top of
 * its mask while a copy rises in from below, then rolls back down on leave.
 * Decorative only; with reduced motion the text stays as plain text.
 */
export default function RollingText({ text, className }: RollingTextProps) {
	const ref = useRef<HTMLSpanElement>(null);

	useAppGSAP(
		(_, contextSafe) => {
			const el = ref.current;
			if (!el || !contextSafe) return;

			matchFullMotion(() => {
				const split = SplitText.create(el, {
					type: "words,chars",
					mask: "chars",
				});

				// Clip only vertically: negative letter-spacing makes each letter's
				// box narrower than its glyph, so clipping sideways cuts its edges.
				for (const mask of split.masks as HTMLElement[]) {
					mask.style.overflowX = "visible";
					mask.style.overflowY = "clip";
				}

				// Each letter carries a copy one full height below itself, so moving
				// the letter up brings the copy into view behind it.
				for (const char of split.chars) {
					const clone = char.cloneNode(true) as HTMLElement;
					Object.assign(clone.style, {
						position: "absolute",
						top: "100%",
						left: "0",
					});
					char.appendChild(clone);
				}

				// A fresh tween each way rather than reverse(): reversing would also
				// run the ease backwards (slow start) and the stagger right to left.
				// overwrite stops a half-finished roll so the new one starts from
				// wherever the letters are.
				const rollTo = (yPercent: number) =>
					appGSAP.to(split.chars, {
						yPercent,
						duration: 0.45,
						ease: "swiss",
						stagger: 0.03,
						overwrite: true,
					});

				const onEnter = contextSafe(() => rollTo(-100));
				const onLeave = contextSafe(() => rollTo(0));

				el.addEventListener("mouseenter", onEnter);
				el.addEventListener("mouseleave", onLeave);
				return () => {
					el.removeEventListener("mouseenter", onEnter);
					el.removeEventListener("mouseleave", onLeave);
				};
			});
		},
		{ scope: ref },
	);

	return (
		<span ref={ref} className={cn("inline-block", className)}>
			{text}
		</span>
	);
}
