import type { getFeaturedProjects } from "#/features/projects/projects.server";
import type { LandingProjectCard } from "../../public.types";

interface ProjectsSectionProps {
	projects: Awaited<ReturnType<typeof getFeaturedProjects>>;
	ProjectCard: React.ComponentType<LandingProjectCard>;
}

export default function ProjectsSection({
	projects,
	ProjectCard,
}: ProjectsSectionProps) {
	return (
		<div>
			Projects
			{projects.map((project) => (
				<ProjectCard
					{...project}
					key={project.id}
					imageUrl={project.coverImageKey ?? ""}
				/>
			))}
		</div>
	);
}
