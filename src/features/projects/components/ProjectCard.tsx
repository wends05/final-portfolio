import { Link } from "@tanstack/react-router";
import type { FocusEvent, PointerEvent } from "react";
import { isPlainClick } from "#/features/public/utils/pick";
import { cn } from "#/lib/utils";
import type { Project } from "#content";
import { padIndex } from "../projects.utils";

interface ProjectCardProps {
	project: Project;
	/** Position in the /projects order, from 0. */
	index: number;
	/** This tile is the one in the details panel. */
	shown: boolean;
	/** A mouse is over the grid, so tiles other than the shown one dim. */
	dim: boolean;
	/** "row" lays the tile out as a thumbnail-and-title row on phones. */
	layout: "card" | "row";
	onPointerEnter: (event: PointerEvent) => void;
	onFocus: (event: FocusEvent<HTMLElement>) => void;
	/** Starts the pick animation; the page navigates when it ends. */
	onPick: (slug: string) => void;
}

/** A /projects tile: cover, then its number and title. */
export default function ProjectCard({
	project,
	index,
	shown,
	dim,
	layout,
	onPointerEnter,
	onFocus,
	onPick,
}: ProjectCardProps) {
	const row = layout === "row";

	return (
		<li data-pick-fade data-entrance>
			<Link
				data-tile
				to="/projects/$slug"
				params={{ slug: project.slug }}
				onPointerEnter={onPointerEnter}
				onFocus={onFocus}
				onClick={(e) => {
					if (!isPlainClick(e)) return;
					e.preventDefault();
					onPick(project.slug);
				}}
				className={cn(
					"flex flex-col outline-none transition-opacity duration-200 ease-swiss focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
					dim && !shown && "opacity-40",
					row &&
						"max-md:flex-row max-md:items-center max-md:gap-4 max-md:border-rule-soft max-md:border-b max-md:py-3",
				)}
			>
				<div
					className={cn(
						"relative aspect-3/2 overflow-hidden bg-muted",
						row && "max-md:w-5/12 max-md:shrink-0",
					)}
				>
					{project.cover && (
						<img
							src={project.cover.src}
							alt=""
							loading="lazy"
							className="absolute inset-0 size-full object-cover"
						/>
					)}
				</div>
				<p
					className={cn(
						"mt-2.5 flex items-baseline gap-2.5 font-medium text-body transition-colors duration-200 ease-swiss",
						shown ? "text-foreground" : "text-muted-foreground",
						row && "max-md:mt-0 max-md:flex-col max-md:gap-1",
					)}
				>
					<span className="type-label">{padIndex(index + 1)}</span>
					<span>{project.title}</span>
				</p>
			</Link>
		</li>
	);
}
