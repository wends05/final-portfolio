import { formatDate } from "date-fns";
import type { ProjectWithCoverImageUrl } from "#/features/projects/projects.types";
import { cn } from "#/lib/utils";

interface LandingProjectCardProps {
	project: ProjectWithCoverImageUrl;
	active: boolean;
}

export default function LandingProjectCard({
	project,
	active,
}: LandingProjectCardProps) {
	const transitionClassnames =
		"transition-[opacity,translate] duration-300 ease-swiss group-data-[active=false]:translate-y-4 group-data-[active=false]:opacity-0 motion-reduce:translate-y-0";

	const displayDate = project.endedAt
		? formatDate(new Date(project.endedAt), "MMM yyyy")
		: project.startedAt
			? formatDate(new Date(project.startedAt), "MMM yyyy")
			: null;
	return (
		<article
			inert={!active}
			data-active={active}
			className="group col-span-full row-span-2 row-start-2 flex flex-col gap-6 md:grid md:grid-cols-subgrid md:grid-rows-subgrid"
		>
			<h3 className={cn("col-span-full text-display-l", transitionClassnames)}>
				{project.title}
			</h3>

			{/* Section for the content*/}
			<div
				className={cn(
					"flex h-full flex-col justify-between self-end font-label md:col-span-5 md:row-start-2",
					transitionClassnames,
				)}
			>
				<div>
					<p>{project.description}</p>
				</div>
				<div>
					<span>{displayDate}</span>
					{" | "}
					<span className="text-neutral-800">{project.teamName || "self"}</span>
				</div>
			</div>

			<div className="relative aspect-16/10 self-end bg-muted group-data-[active=false]:invisible md:col-span-6 md:col-start-6 md:row-start-2">
				{project.coverImageUrl && (
					<img src={project.coverImageUrl} alt={project.title} />
				)}
			</div>
		</article>
	);
}
