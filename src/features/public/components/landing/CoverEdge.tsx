import type { CSSProperties } from "react";
import { PINNED_TEXT_SCROLL } from "#/features/public/utils/pinned-text";

/**
 * The soft leading edge of a section that slides over pinned text: it
 * dissolves the text before the section's solid edge reaches it. Make it the
 * first child of a `relative z-10 bg-background` wrapper. It sits above the
 * wrapper, and only exists with motion.
 */
export default function CoverEdge() {
	return (
		<div
			aria-hidden
			style={{ "--edge": `${PINNED_TEXT_SCROLL.edge}svh` } as CSSProperties}
			className="pointer-events-none hidden h-(--edge) bg-linear-to-b from-background/0 to-background motion-safe:absolute motion-safe:inset-x-0 motion-safe:bottom-full motion-safe:block"
		/>
	);
}
