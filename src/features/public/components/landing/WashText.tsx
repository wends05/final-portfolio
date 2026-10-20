import { cn } from "#/lib/utils";

interface WashTextProps {
	children: string;
	className?: string;
}

/**
 * Text with an ink wash for list picks. The wash is an ink box holding a paper
 * copy of the text, hidden by its clip-path until usePickTransition reveals it
 * left to right, so the text turns ink at the wash's edge.
 *
 * The copy may wrap. The ink overhangs the text by 0.12em on the left and
 * 0.08em on the right, and padding cancels both, so the copy's content box is
 * exactly as wide as the text and a title over several lines breaks at the
 * same words in both.
 */
export default function WashText({ children, className }: WashTextProps) {
	return (
		<span className={cn("relative inline-block", className)}>
			<span
				aria-hidden
				data-pick-wash
				className="wash-hidden absolute inset-y-0 -right-overhang-sm -left-overhang bg-primary pr-overhang-sm pl-overhang text-primary-foreground"
			>
				{children}
			</span>
			{children}
		</span>
	);
}
