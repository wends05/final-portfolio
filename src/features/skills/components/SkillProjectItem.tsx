import { Link } from "@tanstack/react-router";
import type { CSSProperties } from "react";
import ProjectCoverTile from "#/features/projects/components/ProjectCoverTile";
import WashText from "#/features/public/components/landing/WashText";
import { isPlainClick } from "#/features/public/utils/pick";
import type { SkillProject } from "../skills.types";

interface SkillProjectItemProps {
	project: SkillProject;
	/** Starts the pick transition; the page navigates when it ends. */
	onPick: (slug: string) => void;
	/** Position in the grid, for the stagger when the filter changes. */
	index: number;
}

/**
 * A project on a skill page: its cover, or the numbered tile that
 * stands in for one, with the title on a label in the lower left corner,
 * linking to the case study. Cards remount when the filter changes, so they fade up
 * 16px one after another, like the /projects panel swap.
 */
export default function SkillProjectItem({
	project,
	onPick,
	index,
}: SkillProjectItemProps) {
	return (
		<li
			data-project
			data-slug={project.slug}
			style={{ "--stagger": `${Math.min(index, 5) * 60}ms` } as CSSProperties}
			className="starting:translate-y-4 starting:opacity-0 transition-fade-rise delay-(--stagger) duration-300 ease-swiss motion-reduce:starting:translate-y-0"
		>
			<Link
				to="/projects/$slug"
				params={{ slug: project.slug }}
				onClick={(e) => {
					if (!isPlainClick(e)) return;
					e.preventDefault();
					onPick(project.slug);
				}}
				className="focus-ring relative flex min-h-40 items-end overflow-hidden bg-background p-5 transition-transform duration-300 ease-swiss active:scale-98 md:min-h-55"
			>
				{project.cover ? (
					<img
						src={project.cover.src}
						alt=""
						loading="lazy"
						className="absolute inset-0 size-full object-cover"
					/>
				) : (
					<ProjectCoverTile
						number={project.number}
						status={project.status.toLowerCase()}
						year={project.year}
					/>
				)}
				<span
					data-pick-title
					className="relative bg-background px-2 py-1 text-heading-m"
				>
					<WashText>{project.title}</WashText>
				</span>
			</Link>
		</li>
	);
}
