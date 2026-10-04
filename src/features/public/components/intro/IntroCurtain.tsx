import { useRef, useState } from "react";
import { gsap, useGSAP } from "#/lib/gsap";
import {
	FULL_MOTION,
	INTRO_LIFT_AT,
	introPlaying,
	markIntroSeen,
	REDUCED_MOTION,
} from "../../lib/intro";

interface IntroCurtainProps {
	onActiveChange: (active: boolean) => void;
}

export default function IntroCurtain({ onActiveChange }: IntroCurtainProps) {
	const root = useRef<HTMLDivElement>(null);
	const count = useRef<HTMLSpanElement>(null);

	const [done, setDone] = useState(false);

	useGSAP(
		() => {
			if (!introPlaying()) return setDone(true);
			const el = root.current;
			if (!el) return;
			onActiveChange(true);
			el.style.animation = "none"; // cancel the CSS fail-safe
			const counter = { n: 0 };

			gsap
				.matchMedia()
				.add(
					{ motion: FULL_MOTION, reduce: REDUCED_MOTION },
					({ conditions }) => {
						gsap
							.timeline({
								onComplete: () => {
									markIntroSeen();
									onActiveChange(false);
									setDone(true);
								},
							})
							.from(
								".intro-curtain-label",
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
								".intro-progress",
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
								conditions?.reduce
									? { autoAlpha: 0, duration: 0.8, ease: "none" }
									: { yPercent: -100, duration: 0.8, ease: "curtain" },
								INTRO_LIFT_AT,
							);
					},
				);
			return () => onActiveChange(false);
		},
		{ scope: root },
	);

	if (done) return null;
	return (
		<div
			ref={root}
			aria-hidden="true"
			className="intro-curtain fixed inset-0 z-50 flex-col justify-between px-4 py-6 text-foreground md:p-12"
		>
			<p className="intro-curtain-label">portfolio.wends.dev</p>
			<div className="flex flex-col gap-4">
				<div className="flex items-baseline gap-3 font-label tabular-nums">
					<span ref={count} className="intro-counter">
						000
					</span>
					<span className="type-index">/ 100</span>
				</div>
				<div className="h-px bg-rule/15">
					<div className="intro-progress h-px bg-rule" />
				</div>
			</div>
		</div>
	);
}
