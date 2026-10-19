import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

interface ProjectLinkButtonsProps {
	/** From `getProjectLinks`: the first one is the solid button. */
	links: { label: string; href: string }[];
	className?: string;
	/** Rises in with the page entrance. */
	entrance?: boolean;
}

/**
 * The project's external links as buttons. The case study shows them twice,
 * under the title and at the end, so they are there before and after reading.
 */
export default function ProjectLinkButtons({
	links,
	className,
	entrance,
}: ProjectLinkButtonsProps) {
	if (links.length === 0) return null;

	return (
		<ul
			data-entrance={entrance || undefined}
			className={cn("flex flex-wrap gap-2", className)}
		>
			{links.map((link, i) => (
				<li key={link.label}>
					<Button
						nativeButton={false}
						variant={i === 0 ? "default" : "outline-rule"}
						size="page"
						render={
							<a href={link.href} target="_blank" rel="noreferrer">
								{link.label}
								<ArrowUpRightIcon aria-hidden />
								<span className="sr-only">(opens in a new tab)</span>
							</a>
						}
					/>
				</li>
			))}
		</ul>
	);
}
