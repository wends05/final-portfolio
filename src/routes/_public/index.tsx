import { createFileRoute } from "@tanstack/react-router";
import { CompositeComponent } from "@tanstack/react-start/rsc";
import React from "react";
import DescriptionSection from "#/features/public/components/landing/DescriptionSection";
import HeroSection from "#/features/public/components/landing/HeroSection";
import ProjectCard from "#/features/public/components/landing/ProjectCard";
import SkillCard from "#/features/public/components/landing/SkillCard";
import {
	getProjectsSection,
	getSkillsSection,
} from "#/features/public/public.functions";

export const Route = createFileRoute("/_public/")({
	component: Home,
	loader: async () => {
		const components = await Promise.all([
			getProjectsSection(),
			getSkillsSection(),
		]);
		return components;
	},
});

function Home() {
	const [ProjectsSection, SkillsSection] = Route.useLoaderData();
	return (
		<>
			<HeroSection />
			<DescriptionSection />
			<CompositeComponent src={ProjectsSection.src} ProjectCard={ProjectCard} />
			<React.Suspense fallback={<div>Waiting...</div>}>
				<CompositeComponent src={SkillsSection.src} SkillCard={SkillCard} />
			</React.Suspense>
		</>
	);
}
