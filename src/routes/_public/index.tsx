import { createFileRoute } from "@tanstack/react-router";
import DescriptionSection from "#/features/public/components/landing/DescriptionSection";
import HeroSection from "#/features/public/components/landing/HeroSection";
import ProjectCard from "#/features/public/components/landing/ProjectCard";
import ProjectsSection from "#/features/public/components/landing/ProjectsSection";
import SkillCard from "#/features/public/components/landing/SkillCard";
import SkillsSection from "#/features/public/components/landing/SkillsSection";
import { getHomepage } from "#/features/public/public.functions";

export const Route = createFileRoute("/_public/")({
	component: Home,
	loader: () => getHomepage(),
});

function Home() {
	const { projects, skills } = Route.useLoaderData();
	return (
		<>
			<HeroSection />
			<DescriptionSection />
			<ProjectsSection projects={projects} ProjectCard={ProjectCard} />
			<SkillsSection skills={skills} SkillCard={SkillCard} />
		</>
	);
}
