import { Link } from "@tanstack/react-router";
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
 * A project on a skill page: its title on a card, linking to the
 * case study. Cards remount when the filter changes, so they fade up
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
			style={{ transitionDelay: `${Math.min(index, 5) * 60}ms` }}
			className="starting:translate-y-4 starting:opacity-0 transition-[opacity,translate] duration-300 ease-swiss motion-reduce:starting:translate-y-0"
		>
			<Link
				to="/projects/$"
				params={{ _splat: project.slug }}
				onClick={(e) => {
					if (!isPlainClick(e)) return;
					e.preventDefault();
					onPick(project.slug);
				}}
				className="focus-ring flex min-h-40 items-end bg-background p-5 transition-[scale] duration-300 ease-swiss active:scale-98 md:min-h-55"
			>
				<span data-pick-title className="text-heading-m">
					<WashText>{project.title}</WashText>
				</span>
			</Link>
		</li>
	);
}
