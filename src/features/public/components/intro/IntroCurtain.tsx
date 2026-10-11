import { useRef, useState } from "react";
import {
	INTRO_LIFT_AT,
	introPlaying,
	markIntroSeen,
} from "#/features/public/utils/intro";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchMotion } from "#/integrations/animations/motion";

interface IntroCurtainProps {
	onActiveChange: (active: boolean) => void;
}

export default function IntroCurtain({ onActiveChange }: IntroCurtainProps) {
	const root = useRef<HTMLDivElement>(null);
	const count = useRef<HTMLSpanElement>(null);

	const [done, setDone] = useState(false);

	useAppGSAP(
		() => {
			if (!introPlaying()) return setDone(true);
			const el = root.current;
			if (!el) return;
			onActiveChange(true);
			el.style.animation = "none"; // cancel the CSS fail-safe
			const counter = { n: 0 };

			matchMotion(({ reduce }) => {
				appGSAP
					.timeline({
						onComplete: () => {
							markIntroSeen();
							onActiveChange(false);
							setDone(true);
						},
					})
					.from(
						"[data-intro-label]",
						{ autoAlpha: 0, duration: 0.3, ease: "none" },
						0,
					)
					.to(
						counter,
						{
							n: 100,
							duration: 1.4,
							ease: "power3.inOut",
							onUpdate: () => {
								if (count.current)
									count.current.textContent = String(
										Math.round(counter.n),
									).padStart(3, "0");
							},
						},
						0,
					)
					.from(
						"[data-intro-progress]",
						{
							scaleX: 0,
							transformOrigin: "left",
							duration: 1.4,
							ease: "power3.inOut",
						},
						0,
					)
					.to(
						el,
						reduce
							? { autoAlpha: 0, duration: 0.8, ease: "none" }
							: { yPercent: -100, duration: 0.8, ease: "curtain" },
						INTRO_LIFT_AT,
					);
			});
			return () => onActiveChange(false);
		},
		{ scope: root },
	);

	if (done) return null;
	return (
		<div
			ref={root}
			aria-hidden="true"
			className="intro-curtain fixed inset-0 z-60 flex-col justify-between px-4 py-6 text-foreground md:p-12"
		>
			<p data-intro-label>portfolio.wends.dev</p>
			<div className="flex flex-col gap-4">
				<div className="flex items-baseline gap-3 font-label tabular-nums">
					<span ref={count}>000</span>
					<span className="type-index">/ 100</span>
				</div>
				<div className="h-px bg-rule/15">
					<div data-intro-progress className="h-px bg-rule" />
				</div>
			</div>
		</div>
	);
}
