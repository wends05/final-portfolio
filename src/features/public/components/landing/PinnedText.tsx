import { SplitText } from "gsap/SplitText";
import { type CSSProperties, useRef } from "react";
import {
	PINNED_TEXT_SCROLL,
	pinnedTextPad,
	pinnedTextRunway,
} from "#/features/public/utils/pinned-text";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchFullMotion } from "#/integrations/animations/motion";
import { cn } from "#/lib/utils";

const { fadeIn, fill, cover, inkShare } = PINNED_TEXT_SCROLL;

// The layout reads the same numbers as the timeline. They go in as custom
// properties so the `motion-safe:` classes below can still switch them off.
const trackVars = {
	"--pinned-fade-in": `${fadeIn}svh`,
	"--pinned-cover": `${cover}svh`,
	"--pinned-runway": `${pinnedTextRunway()}svh`,
} as CSSProperties;

interface PinnedTextProps {
	paragraphs: readonly string[];
	/** Extra classes for the stage, e.g. a different row gap. */
	className?: string;
	/** Extra classes for each paragraph, e.g. its column start and indent. */
	paragraphClassName?: string;
}

/**
 * Text that pins to the viewport while its words ink from subtle to full
 * color, then rests until the next section slides over it. The next section
 * brings the cover: `relative z-10 bg-background` and a `CoverEdge`.
 */
export default function PinnedText({
	paragraphs,
	className,
	paragraphClassName,
}: PinnedTextProps) {
	const track = useRef<HTMLElement>(null);
	const stage = useRef<HTMLDivElement>(null);

	useAppGSAP(
		() => {
			const trackEl = track.current;
			const stageEl = stage.current;

			if (!trackEl || !stageEl) return;

			matchFullMotion(() => {
				// One array across all paragraphs, so they ink in reading order.
				const q = appGSAP.utils.selector(stageEl);
				const words = (q("p") as HTMLElement[]).flatMap(
					(p) => SplitText.create(p, { type: "words", tag: "span" }).words,
				);
				const inkTime = fill * inkShare;

				appGSAP
					.timeline({
						scrollTrigger: {
							trigger: trackEl,
							start: "top top", // stage sticks
							end: "bottom bottom", // stage releases
							scrub: true,
						},
					})
					.fromTo(
						stageEl,
						{ opacity: 0 },
						{ opacity: 1, duration: fadeIn, ease: "none" },
					)
					.fromTo(
						words,
						{ "--ink": 0 },
						{
							"--ink": 1,
							duration: inkTime,
							ease: "none",
							stagger: { amount: fill - inkTime },
						},
					)
					// Hold, then the next section covers the stage: scroll only, no tween.
					.to({}, { duration: pinnedTextPad() });
			});
		},
		{
			scope: track,
		},
	);

	return (
		<section
			ref={track}
			style={trackVars}
			className="motion-safe:-mt-(--pinned-fade-in) motion-safe:-mb-(--pinned-cover) motion-safe:h-(--pinned-runway)"
		>
			<div
				ref={stage}
				className={cn(
					"page-grid pointer-events-none sticky top-0 h-svh content-center gap-y-8",
					className,
				)}
			>
				{paragraphs.map((paragraph) => (
					<p
						key={paragraph}
						// SplitText sets display:inline-block on words, which breaks
						// text-justify spacing; only color animates, so keep them inline.
						className={cn(
							"[&>span]:inline! ink-words col-span-4 self-center text-justify font-normal text-heading-l md:col-span-8",
							paragraphClassName,
						)}
					>
						{paragraph}
					</p>
				))}
			</div>
		</section>
	);
}
