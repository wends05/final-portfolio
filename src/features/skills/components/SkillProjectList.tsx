import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react/ssr";
import { Button } from "#/components/ui/button";
import type { SkillProject, ToolPreview } from "../skills.types";
import SkillProjectItem from "./SkillProjectItem";

interface SkillProjectListProps {
	/** The projects left after the filter. */
	projects: SkillProject[];
	/** The selected tool, or undefined when the filter shows all tools. */
	selected: ToolPreview | undefined;
	skillName: string;
	/** Clears the tool filter. */
	onReset: () => void;
	/** Starts the pick transition; the page navigates when it ends. */
	onPick: (slug: string) => void;
}

/**
 * A skill page's projects: a header naming the filter, then the
 * cards, or a line saying none use the selected tool (or the skill) yet, with a
 * button to reset the filter.
 */
export default function SkillProjectList({
	projects,
	selected,
	skillName,
	onReset,
	onPick,
}: SkillProjectListProps) {
	return (
		<section
			aria-labelledby="skill-projects"
			className="-mx-4 px-4 py-6 md:mx-0 md:p-6"
		>
			<div
				data-pick-fade
				data-entrance
				className="mb-5 flex items-baseline justify-between gap-4"
			>
				<h2 id="skill-projects" className="text-heading-l">
					Projects
				</h2>
				<p aria-live="polite" className="type-meta text-muted-foreground">
					{selected ? `using ${selected.name}` : "all tools"}
				</p>
			</div>
			{/* A stable wrapper carries the entrance: the content inside remounts
			    when the filter changes, and a remounted data-entrance element would
			    stay hidden under entrance.css. */}
			<div data-entrance>
				{projects.length === 0 ? (
					<div
						key={selected?.id ?? "all"}
						data-pick-fade
						className="flex starting:translate-y-4 flex-col items-start gap-5 py-12 starting:opacity-0 transition-[opacity,translate] duration-300 ease-swiss motion-reduce:starting:translate-y-0"
					>
						<p className="text-muted-foreground">
							No published projects use {selected?.name ?? skillName} yet.
						</p>
						{selected && (
							<Button
								variant="outline"
								onClick={onReset}
								className="type-label h-11 gap-2 rounded-none border-rule px-4 hover:bg-primary hover:text-primary-foreground max-md:px-3"
							>
								<ArrowCounterClockwiseIcon aria-hidden />
								Reset filter
							</Button>
						)}
					</div>
				) : (
					// The cards are keyed by filter, so every press replays their fade-up.
					<ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
						{projects.map((project, index) => (
							<SkillProjectItem
								key={`${selected?.id ?? "all"}:${project.id}`}
								index={index}
								project={project}
								onPick={onPick}
							/>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}
