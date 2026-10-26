import { cn } from "#/lib/utils";

interface ProjectCoverTileProps {
	/** The project's number in the /projects order, as two digits. */
	number: string;
	status: string;
	year: string;
	className?: string;
}

/**
 * Stands in for a project's cover when it has none: six column rules, the
 * project's number, its status and its year. It fills the nearest positioned
 * ancestor, as the image would, and is decoration only. The labels drop out
 * on tiles too narrow to hold them.
 */
export default function ProjectCoverTile({
	number,
	status,
	year,
	className,
}: ProjectCoverTileProps) {
	return (
		<div
			aria-hidden
			className={cn(
				"@container tile-columns absolute inset-0 overflow-hidden text-foreground",
				className,
			)}
		>
			<p className="type-label absolute @sm:top-4 top-2.5 @sm:left-4 left-2.5 @max-[12.5rem]:hidden">
				{status}
			</p>
			<p className="type-label absolute @sm:top-4 top-2.5 @sm:right-4 right-2.5 @max-[12.5rem]:hidden text-muted-foreground">
				{year}
			</p>
			<p className="tile-numeral absolute left-2 font-semibold tabular-nums">
				{number}
			</p>
			<span className="absolute @sm:right-4 right-2.5 @sm:bottom-4 bottom-2.5 @sm:size-6 size-3.5 border-foreground border-r border-b" />
		</div>
	);
}
