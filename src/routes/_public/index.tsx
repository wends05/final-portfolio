import { createFileRoute } from "@tanstack/react-router";
import ContactSection from "#/features/public/components/landing/ContactSection";
import DescriptionSection from "#/features/public/components/landing/DescriptionSection";
import EndSection from "#/features/public/components/landing/EndSection";
import HeroSection from "#/features/public/components/landing/HeroSection";
import LandingProjectsSection from "#/features/public/components/landing/LandingProjectsSection";
import LandingSkillsSection from "#/features/public/components/landing/LandingSkillsSection";
import { getHomepageFn } from "#/features/public/public.functions";

export const Route = createFileRoute("/_public/")({
	component: Home,
	loader: () => getHomepageFn(),
});

function Home() {
	const { projects, skills } = Route.useLoaderData();
	return (
		<div>
			<HeroSection />
			<DescriptionSection />
			<LandingProjectsSection projects={projects} />
			<LandingSkillsSection skills={skills} />
			<EndSection />
			<ContactSection />
		</div>
	);
}
