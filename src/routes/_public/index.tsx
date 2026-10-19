import { createFileRoute } from "@tanstack/react-router";
import ContactSection from "#/features/public/components/landing/ContactSection";
import DescriptionSection from "#/features/public/components/landing/DescriptionSection";
import EndSection from "#/features/public/components/landing/EndSection";
import HeroSection from "#/features/public/components/landing/HeroSection";
import LandingProjectsSection from "#/features/public/components/landing/LandingProjectsSection";
import LandingSkillsSection from "#/features/public/components/landing/LandingSkillsSection";
import { getHomepage } from "#/features/public/public.content";

export const Route = createFileRoute("/_public/")({
	component: Home,
	loader: getHomepage,
});

function Home() {
	const { featuredProjects, topSkills } = Route.useLoaderData();
	return (
		<div>
			<HeroSection />
			<DescriptionSection />
			<LandingProjectsSection projects={featuredProjects} />
			<LandingSkillsSection skills={topSkills} />
			<EndSection />
			<ContactSection />
		</div>
	);
}
