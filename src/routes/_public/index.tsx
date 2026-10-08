import { createFileRoute } from "@tanstack/react-router";
import ContactSection from "#/features/public/components/landing/ContactSection";
import DescriptionSection from "#/features/public/components/landing/DescriptionSection";
import HeroSection from "#/features/public/components/landing/HeroSection";
import LandingProjectsSection from "#/features/public/components/landing/LandingProjectsSection";
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
		<div className="flex flex-col gap-3 md:gap-10">
			<HeroSection />
			<DescriptionSection />
			<LandingProjectsSection projects={projects} />
			<SkillsSection skills={skills} SkillCard={SkillCard} />
			<ContactSection />
		</div>
	);
}
