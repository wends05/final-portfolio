import { setTimeout } from "node:timers";
import { createServerFn } from "@tanstack/react-start";
import { createCompositeComponent } from "@tanstack/react-start/rsc";
import { getFeaturedProjects } from "../projects/projects.server";
import { getTopSkills } from "../skills/skills.server";
import ProjectsSection from "./components/landing/ProjectsSection";
import SkillsSection from "./components/landing/SkillsSection";
import type { LandingProjectCard, LandingSkillsCard } from "./public.types";

export const getProjectsSection = createServerFn().handler(async () => {
	const projects = await getFeaturedProjects({ limit: 3 });
	const src = await createCompositeComponent(
		({
			ProjectCard,
		}: {
			ProjectCard: React.ComponentType<LandingProjectCard>;
		}) => <ProjectsSection projects={projects} ProjectCard={ProjectCard} />,
	);

	return { src };
});

export const getSkillsSection = createServerFn().handler(async () => {
	const topSkills = await getTopSkills({ limit: 3 });
	await Promise.resolve(() => setTimeout(() => {}, 5000));
	const src = await createCompositeComponent(
		({ SkillCard }: { SkillCard: React.ComponentType<LandingSkillsCard> }) => (
			<SkillsSection skills={topSkills} SkillCard={SkillCard} />
		),
	);
	return { src };
});
